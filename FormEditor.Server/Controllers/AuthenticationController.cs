﻿using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using FormEditor.Server.Models;
using FormEditor.Server.Services;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication;

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
    private readonly IApiTokenService _apiTokenService;

    private static readonly EmailAddressAttribute _emailAddressAttribute = new();

    public AuthenticationController(UserManager<User> userManager, IUserStore<User> userStore,
        SignInManager<User> signInManager, TimeProvider timeProvider,
        IOptionsMonitor<BearerTokenOptions> bearerTokenOptions, IEmailSender<User> emailSender,
        LinkGenerator linkGenerator, IApiTokenService apiTokenService)
    {
        _userManager = userManager;
        _userStore = userStore;
        _emailStore = (IUserEmailStore<User>)userStore;
        _signInManager = signInManager;
        _timeProvider = timeProvider;
        _bearerTokenOptions = bearerTokenOptions;
        _emailSender = emailSender;
        _linkGenerator = linkGenerator;
        _apiTokenService = apiTokenService;
    }
    
    [HttpGet("api-token")]
    [Authorize]
    public async Task<Results<Ok<ApiTokenViewModel>, ProblemHttpResult>> GetApiToken()
    {
        var userId = User.GetUserId();
        var result = await _apiTokenService.GetUserToken(userId);
        if (result.IsOk)
        {
            return TypedResults.Ok(new ApiTokenViewModel { ApiToken = result.Value });
        }

        return result.Error.IntoRespose();
    }

    [HttpPost("api-token")]
    [Authorize]
    public async Task<Ok<ApiTokenViewModel>> GenerateApiToken()
    {
        var userId = User.GetUserId();
        var token = await _apiTokenService.GenerateTokenForUser(userId);
        return TypedResults.Ok(new ApiTokenViewModel { ApiToken = token });
    }

    [HttpGet("external-login")]
    public ChallengeHttpResult ExternalLogin([FromQuery] Provider provider, [FromQuery] string returnUrl = null)
    {
        var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Authentication", new { returnUrl });
        var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider.ToString(), redirectUrl);
        return TypedResults.Challenge(properties, [provider.ToString()]);
    }

    [HttpGet("external-login-callback")]
    public async Task<Results<Ok<AccessTokenResponse>, RedirectHttpResult, ProblemHttpResult>> ExternalLoginCallback(
        string? returnUrl = null, string? remoteError = null)
    {
        returnUrl ??= Url.Content("~/");
        if (remoteError != null)
        {
            return TypedResults.Redirect(QueryHelpers.AddQueryString(returnUrl, "error",
                "Error from external provider: {remoteError}"));
        }

        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            return TypedResults.Redirect(QueryHelpers.AddQueryString(returnUrl, "error",
                "Error loading external login information."));
        }

        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey,
            isPersistent: false, bypassTwoFactor: true);
        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                return TypedResults.Redirect(QueryHelpers.AddQueryString(returnUrl, "error", "User is blocked"));
            }

            var picture = info.Principal.FindFirstValue("picture");
            var name = info.Principal.FindFirstValue(ClaimTypes.Name);
            var newUser = new User
                { UserName = email, Email = email, EmailConfirmed = true, Avatar = picture, Name = name };
            var createResult = await _userManager.CreateAsync(newUser);
            if (createResult.Succeeded)
            {
                createResult = await _userManager.AddLoginAsync(newUser, info);
            }

            if (!createResult.Succeeded)
            {
                return TypedResults.Redirect(QueryHelpers.AddQueryString(returnUrl, "error",
                    createResult.Errors.First().Description));
            }
        }

        var user = await _userManager.FindByEmailAsync(email);
        var principal = await _signInManager.CreateUserPrincipalAsync(user);
        var token = CreateToken(principal);
        var redirectUrl = QueryHelpers.AddQueryString(returnUrl, new Dictionary<string, string?>
        {
            { "accessToken", token.AccessToken },
            { "refreshToken", token.RefreshToken },
            { "expiresIn", token.ExpiresIn.ToString() }
        });

        return TypedResults.Redirect(redirectUrl);
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
        var user = new User
        {
            Name = name,
        };
        await _userStore.SetUserNameAsync(user, email, CancellationToken.None);
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

        if (await _signInManager.CanSignInAsync(user))
        {
            return TypedResults.Unauthorized();
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
    public async Task<Results<Ok, ValidationProblem>> ResendConfirmationEmail(
        [FromBody] ResendConfirmationEmailRequest resendRequest)
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
                await _emailSender.SendPasswordResetCodeAsync(user, resetRequest.Email,
                    HtmlEncoder.Default.Encode(code));
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

    private AccessTokenResponse CreateToken(ClaimsPrincipal user)
    {
        var utcNow = TimeProvider.System.GetUtcNow();
        var option = _bearerTokenOptions.Get(IdentityConstants.BearerScheme);
        var response = new AccessTokenResponse
        {
            AccessToken = option.BearerTokenProtector.Protect(CreateBearerTicket(user, utcNow)),
            ExpiresIn = (long)option.BearerTokenExpiration.TotalSeconds,
            RefreshToken = option.RefreshTokenProtector.Protect(CreateRefreshTicket(user, utcNow)),
        };

        return response;
    }


    private AuthenticationTicket CreateBearerTicket(ClaimsPrincipal user, DateTimeOffset utcNow)
    {
        var option = _bearerTokenOptions.Get(IdentityConstants.BearerScheme);
        var bearerProperties = new AuthenticationProperties
        {
            ExpiresUtc = utcNow + option.RefreshTokenExpiration
        };
        return new AuthenticationTicket(user, bearerProperties, $"{IdentityConstants.BearerScheme}:AccessToken");
    }

    private AuthenticationTicket CreateRefreshTicket(ClaimsPrincipal user, DateTimeOffset utcNow)
    {
        var option = _bearerTokenOptions.Get(IdentityConstants.BearerScheme);
        var refreshProperties = new AuthenticationProperties
        {
            ExpiresUtc = utcNow + option.RefreshTokenExpiration
        };

        return new AuthenticationTicket(user, refreshProperties, $"{IdentityConstants.BearerScheme}:RefreshToken");
    }
}