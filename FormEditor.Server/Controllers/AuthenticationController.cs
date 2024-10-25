using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Net.Mail;
using System.Text;
using System.Text.Encodings.Web;
using FormEditor.Server.Models;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;

namespace FormEditor.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthenticationController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly IUserStore<User> _userStore;
    private readonly IUserEmailStore<User> _emailStore;
    private readonly SignInManager<User> _signInManager;
    private readonly TimeProvider _timeProvider;
    private readonly IOptionsMonitor<BearerTokenOptions> _bearerTokenOptions;
    private readonly IEmailSender<User> _emailSender;
    private readonly LinkGenerator _linkGenerator;

    private static readonly EmailAddressAttribute _emailAddressAttribute = new();

    public AuthenticationController(UserManager<User> userManager, IUserStore<User> userStore,
        SignInManager<User> signInManager, TimeProvider timeProvider,
        IOptionsMonitor<BearerTokenOptions> bearerTokenOptions, IEmailSender<User> emailSender,
        LinkGenerator linkGenerator)
    {
        this._userManager = userManager;
        this._userStore = userStore;
        this._emailStore = (IUserEmailStore<User>)userStore;
        this._signInManager = signInManager;
        this._timeProvider = timeProvider;
        this._bearerTokenOptions = bearerTokenOptions;
        this._emailSender = emailSender;
        this._linkGenerator = linkGenerator;
    }

    [HttpPost("registration")]
    public async Task<Results<Ok, ValidationProblem>> Registration([FromBody] RegistrationViewModel registration)
    {
        if (!_userManager.SupportsUserEmail)
        {
            throw new NotSupportedException($"{nameof(Registration)} requires a user store with email support.");
        }

        var email = registration.Email;

        if (string.IsNullOrEmpty(email) || !_emailAddressAttribute.IsValid(email))
        {
            return CreateValidationProblem(IdentityResult.Failed(_userManager.ErrorDescriber.InvalidEmail(email)));
        }

        var name = registration.Name;
        var user = new User();
        await _userStore.SetUserNameAsync(user, name, CancellationToken.None);
        await _emailStore.SetEmailAsync(user, email, CancellationToken.None);
        var result = await _userManager.CreateAsync(user, registration.Password);

        if (!result.Succeeded)
        {
            return CreateValidationProblem(result);
        }

        try
        {
            await SendConfirmationEmailAsync(user, _userManager, HttpContext, email);
        }
        catch (SmtpException exp)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                { { "EmailSendFailed", ["Failed to send email"] } });
        }

        return TypedResults.Ok();
    }

    [HttpPost("login")]
    public async Task<Results<Ok<AccessTokenResponse>, EmptyHttpResult, ProblemHttpResult>> Login(
        [FromBody] LoginRequest login)
    {
        _signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
        var user = await _userManager.FindByEmailAsync(login.Email);
        if (user == null)
        {
            return TypedResults.Problem("User with provided Email not found",
                statusCode: StatusCodes.Status401Unauthorized);
        }

        var result = await _signInManager.PasswordSignInAsync(user, login.Password, false, lockoutOnFailure: false);

        if (result.RequiresTwoFactor)
        {
            if (!string.IsNullOrEmpty(login.TwoFactorCode))
            {
                result = await _signInManager.TwoFactorAuthenticatorSignInAsync(login.TwoFactorCode, false,
                    rememberClient: false);
            }
            else if (!string.IsNullOrEmpty(login.TwoFactorRecoveryCode))
            {
                result = await _signInManager.TwoFactorRecoveryCodeSignInAsync(login.TwoFactorRecoveryCode);
            }
        }

        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                return TypedResults.Problem("User is blocked", statusCode: StatusCodes.Status401Unauthorized);
            }

            if (result.IsNotAllowed)
            {
                if (!user.EmailConfirmed)
                    return TypedResults.Problem("Email address is not verified",
                        statusCode: StatusCodes.Status401Unauthorized);
                return TypedResults.Problem("Login not allowed", statusCode: StatusCodes.Status401Unauthorized);
            }

            return TypedResults.Problem("Incorrect password", statusCode: StatusCodes.Status401Unauthorized);
        }

        // The signInManager already produced the needed response in the form of a cookie or bearer token.
        return TypedResults.Empty;
    }

    [HttpPost("refresh")]
    public async Task<Results<Ok<AccessTokenResponse>, UnauthorizedHttpResult, SignInHttpResult, ChallengeHttpResult>>
        Refresh([FromBody] RefreshRequest refreshRequest)
    {
        var refreshTokenProtector = _bearerTokenOptions.Get(IdentityConstants.BearerScheme).RefreshTokenProtector;
        var refreshTicket = refreshTokenProtector.Unprotect(refreshRequest.RefreshToken);

        // Reject the /refresh attempt with a 401 if the token expired or the security stamp validation fails
        if (refreshTicket?.Properties?.ExpiresUtc is not { } expiresUtc ||
            _timeProvider.GetUtcNow() >= expiresUtc ||
            await _signInManager.ValidateSecurityStampAsync(refreshTicket.Principal) is not User user)

        {
            return TypedResults.Challenge();
        }

        var newPrincipal = await _signInManager.CreateUserPrincipalAsync(user);
        return TypedResults.SignIn(newPrincipal, authenticationScheme: IdentityConstants.BearerScheme);
    }

    [HttpGet("confirmEmail")]
    public async Task<Results<ContentHttpResult, UnauthorizedHttpResult>> ConfirmEmail([FromQuery] string userId,
        [FromQuery] string code, [FromQuery] string? changedEmail)
    {
        if (await _userManager.FindByIdAsync(userId) is not { } user)
        {
            // We could respond with a 404 instead of a 401 like Identity UI, but that feels like unnecessary information.
            return TypedResults.Unauthorized();
        }

        try
        {
            code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
        }
        catch (FormatException)
        {
            return TypedResults.Unauthorized();
        }

        IdentityResult result;

        if (string.IsNullOrEmpty(changedEmail))
        {
            result = await _userManager.ConfirmEmailAsync(user, code);
        }
        else
        {
            // As with Identity UI, email and user name are one and the same. So when we update the email,
            // we need to update the user name.
            result = await _userManager.ChangeEmailAsync(user, changedEmail, code);

            if (result.Succeeded)
            {
                result = await _userManager.SetUserNameAsync(user, changedEmail);
            }
        }

        if (!result.Succeeded)
        {
            return TypedResults.Unauthorized();
        }

        return TypedResults.Text("Thank you for confirming your email.");
    }

    [HttpPost("resendConfirmationEmail")]
    public async Task<Results<Ok, ValidationProblem>> ResendConfirmationEmail([FromBody] ResendConfirmationEmailRequest resendRequest)
    {
        if (await _userManager.FindByEmailAsync(resendRequest.Email) is not { } user)
        {
            return TypedResults.Ok();
        }
        
        try
        {
            await SendConfirmationEmailAsync(user, _userManager, HttpContext, resendRequest.Email);
        }
        catch (SmtpException exp)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                { { "EmailSendFailed", ["Failed to send email. Try again later"] } });
        }
        return TypedResults.Ok();
    }

    [HttpPost("forgotPassword")]
    public async Task<Results<Ok, ValidationProblem>> ForgotPassword([FromBody] ForgotPasswordRequest resetRequest)
    {
        var user = await _userManager.FindByEmailAsync(resetRequest.Email);

        if (user is not null && await _userManager.IsEmailConfirmedAsync(user))
        {
            var code = await _userManager.GeneratePasswordResetTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
            
            try
            {
                await _emailSender.SendPasswordResetCodeAsync(user, resetRequest.Email, HtmlEncoder.Default.Encode(code));
            }
            catch (SmtpException exp)
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                    { { "EmailSendFailed", ["Failed to send email. Try again later"] } });
            }
            
        }

        // Don't reveal that the user does not exist or is not confirmed, so don't return a 200 if we would have
        // returned a 400 for an invalid code given a valid user email.
        return TypedResults.Ok();
    }

    [HttpPost("resetPassword")]
    public async Task<Results<Ok, ValidationProblem>> ResetPassword([FromBody] ResetPasswordRequest resetRequest)
    {
        var user = await _userManager.FindByEmailAsync(resetRequest.Email);

        if (user is null || !(await _userManager.IsEmailConfirmedAsync(user)))
        {
            // Don't reveal that the user does not exist or is not confirmed, so don't return a 200 if we would have
            // returned a 400 for an invalid code given a valid user email.
            return CreateValidationProblem(IdentityResult.Failed(_userManager.ErrorDescriber.InvalidToken()));
        }

        IdentityResult result;
        try
        {
            var code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(resetRequest.ResetCode));
            result = await _userManager.ResetPasswordAsync(user, code, resetRequest.NewPassword);
        }
        catch (FormatException)
        {
            result = IdentityResult.Failed(_userManager.ErrorDescriber.InvalidToken());
        }

        if (!result.Succeeded)
        {
            return CreateValidationProblem(result);
        }

        return TypedResults.Ok();
    }

    [HttpPost("manage/2fa")]
    [Authorize]
    public async Task<Results<Ok<TwoFactorResponse>, ValidationProblem, NotFound>> Manage2Fa(
        [FromBody] TwoFactorRequest tfaRequest)
    {
        var userManager = _signInManager.UserManager;
        if (await userManager.GetUserAsync(User) is not { } user)
        {
            return TypedResults.NotFound();
        }

        if (tfaRequest.Enable == true)
        {
            if (tfaRequest.ResetSharedKey)
            {
                return CreateValidationProblem("CannotResetSharedKeyAndEnable",
                    "Resetting the 2fa shared key must disable 2fa until a 2fa token based on the new shared key is validated.");
            }
            else if (string.IsNullOrEmpty(tfaRequest.TwoFactorCode))
            {
                return CreateValidationProblem("RequiresTwoFactor",
                    "No 2fa token was provided by the request. A valid 2fa token is required to enable 2fa.");
            }
            else if (!await userManager.VerifyTwoFactorTokenAsync(user,
                         userManager.Options.Tokens.AuthenticatorTokenProvider, tfaRequest.TwoFactorCode))
            {
                return CreateValidationProblem("InvalidTwoFactorCode",
                    "The 2fa token provided by the request was invalid. A valid 2fa token is required to enable 2fa.");
            }

            await userManager.SetTwoFactorEnabledAsync(user, true);
        }
        else if (tfaRequest.Enable == false || tfaRequest.ResetSharedKey)
        {
            await userManager.SetTwoFactorEnabledAsync(user, false);
        }

        if (tfaRequest.ResetSharedKey)
        {
            await userManager.ResetAuthenticatorKeyAsync(user);
        }

        string[]? recoveryCodes = null;
        if (tfaRequest.ResetRecoveryCodes ||
            (tfaRequest.Enable == true && await userManager.CountRecoveryCodesAsync(user) == 0))
        {
            var recoveryCodesEnumerable = await userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);
            recoveryCodes = recoveryCodesEnumerable?.ToArray();
        }

        if (tfaRequest.ForgetMachine)
        {
            await _signInManager.ForgetTwoFactorClientAsync();
        }

        var key = await userManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(key))
        {
            await userManager.ResetAuthenticatorKeyAsync(user);
            key = await userManager.GetAuthenticatorKeyAsync(user);

            if (string.IsNullOrEmpty(key))
            {
                throw new NotSupportedException("The user manager must produce an authenticator key after reset.");
            }
        }

        return TypedResults.Ok(new TwoFactorResponse
        {
            SharedKey = key,
            RecoveryCodes = recoveryCodes,
            RecoveryCodesLeft = recoveryCodes?.Length ?? await userManager.CountRecoveryCodesAsync(user),
            IsTwoFactorEnabled = await userManager.GetTwoFactorEnabledAsync(user),
            IsMachineRemembered = await _signInManager.IsTwoFactorClientRememberedAsync(user),
        });
    }

    [HttpGet("manage/info")]
    [Authorize]
    public async Task<Results<Ok<InfoResponse>, ValidationProblem, NotFound>> Info()
    {
        if (await _userManager.GetUserAsync(User) is not { } user)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(await CreateInfoResponseAsync(user, _userManager));
    }

    [HttpPost("manage/info")]
    [Authorize]
    public async Task<Results<Ok<InfoResponse>, ValidationProblem, NotFound>> SetInfo(
        [FromBody] InfoRequest infoRequest)
    {
        if (await _userManager.GetUserAsync(User) is not { } user)
        {
            return TypedResults.NotFound();
        }

        if (!string.IsNullOrEmpty(infoRequest.NewEmail) && !_emailAddressAttribute.IsValid(infoRequest.NewEmail))
        {
            return CreateValidationProblem(
                IdentityResult.Failed(_userManager.ErrorDescriber.InvalidEmail(infoRequest.NewEmail)));
        }

        if (!string.IsNullOrEmpty(infoRequest.NewPassword))
        {
            if (string.IsNullOrEmpty(infoRequest.OldPassword))
            {
                return CreateValidationProblem("OldPasswordRequired",
                    "The old password is required to set a new password. If the old password is forgotten, use /resetPassword.");
            }

            var changePasswordResult =
                await _userManager.ChangePasswordAsync(user, infoRequest.OldPassword, infoRequest.NewPassword);
            if (!changePasswordResult.Succeeded)
            {
                return CreateValidationProblem(changePasswordResult);
            }
        }

        if (!string.IsNullOrEmpty(infoRequest.NewEmail))
        {
            var email = await _userManager.GetEmailAsync(user);

            if (email != infoRequest.NewEmail)
            {
                await SendConfirmationEmailAsync(user, _userManager, HttpContext, infoRequest.NewEmail, isChange: true);
            }
        }

        return TypedResults.Ok(await CreateInfoResponseAsync(user, _userManager));
    }


    private async Task SendConfirmationEmailAsync(User user, UserManager<User> userManager, HttpContext context,
        string email,
        bool isChange = false)
    {
        var code = isChange
            ? await userManager.GenerateChangeEmailTokenAsync(user, email)
            : await userManager.GenerateEmailConfirmationTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

        var userId = await userManager.GetUserIdAsync(user);
        var routeValues = new RouteValueDictionary()
        {
            ["userId"] = userId,
            ["code"] = code,
        };

        if (isChange)
        {
            // This is validated by the /confirmEmail endpoint on change.
            routeValues.Add("changedEmail", email);
        }

        var confirmEmailUrl = _linkGenerator.GetUriByAction(HttpContext, nameof(ConfirmEmail), values: routeValues);

        await _emailSender.SendConfirmationLinkAsync(user, email, HtmlEncoder.Default.Encode(confirmEmailUrl));
    }

    private static ValidationProblem CreateValidationProblem(string errorCode, string errorDescription) =>
        TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            { errorCode, [errorDescription] }
        });

    private static ValidationProblem CreateValidationProblem(IdentityResult result)
    {
        // We expect a single error code and description in the normal case.
        // This could be golfed with GroupBy and ToDictionary, but perf! :P
        Debug.Assert(!result.Succeeded);
        var errorDictionary = new Dictionary<string, string[]>(1);

        foreach (var error in result.Errors)
        {
            string[] newDescriptions;

            if (errorDictionary.TryGetValue(error.Code, out var descriptions))
            {
                newDescriptions = new string[descriptions.Length + 1];
                Array.Copy(descriptions, newDescriptions, descriptions.Length);
                newDescriptions[descriptions.Length] = error.Description;
            }
            else
            {
                newDescriptions = [error.Description];
            }

            errorDictionary[error.Code] = newDescriptions;
        }

        return TypedResults.ValidationProblem(errorDictionary);
    }

    private static async Task<InfoResponse> CreateInfoResponseAsync<User>(User user, UserManager<User> userManager)
        where User : class
    {
        return new()
        {
            Email = await userManager.GetEmailAsync(user) ??
                    throw new NotSupportedException("Users must have an email."),
            IsEmailConfirmed = await userManager.IsEmailConfirmedAsync(user),
        };
    }
}