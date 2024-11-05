using System.Security.Claims;
using System.Text.Encodings.Web;
using FormEditor.Server.Models;
using FormEditor.Server.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace FormEditor.Server.Utils;

sealed class AuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    UserManager<User> userManager,
    IAuthenticationSchemeProvider schemeProvider,
    SignInManager<User> signInManager,
    IApiTokenService apiTokenService)
    : SignInAuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var bearerResult = await Context.AuthenticateAsync(IdentityConstants.BearerScheme);
        if (bearerResult.Failure != null)
        {
            if (!OriginalPath.StartsWithSegments("/api/authentication/refresh", StringComparison.OrdinalIgnoreCase))
            {
                Context.Response.Headers.Append("Token-Expired", "true");
            }
        }

        if (bearerResult.Succeeded)
        {
            return bearerResult;
        }

        // If bearer token authentication fails, try API token authentication
        if (!Request.Headers.TryGetValue("X-API-Token", out var apiKeyHeaderValues))
        {
            return AuthenticateResult.NoResult();
        }

        var providedApiToken = apiKeyHeaderValues.FirstOrDefault();

        if (string.IsNullOrEmpty(providedApiToken))
        {
            return AuthenticateResult.NoResult();
        }

        var userId = await apiTokenService.GetUserIdFromToken(providedApiToken);
        if (!userId.HasValue)
        {
            return AuthenticateResult.Fail("Invalid API token.");
        }

        var user = await userManager.FindByIdAsync(userId.Value.ToString());
        if (user == null)
        {
            return AuthenticateResult.Fail("User not found.");
        }

        var principal = await signInManager.CreateUserPrincipalAsync(user);
        var identity = (ClaimsIdentity)principal.Identity;
        identity.AddClaim(new Claim("ApiAuthentication", "true"));

        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }

    protected override Task HandleSignInAsync(ClaimsPrincipal user, AuthenticationProperties? properties)
    {
        return Context.SignInAsync(IdentityConstants.BearerScheme, user);
    }

    protected override Task HandleSignOutAsync(AuthenticationProperties? properties)
    {
        return Context.SignOutAsync(IdentityConstants.BearerScheme, properties);
    }

    public const string SchemeName = "Identity.CombinedAuthentication";
}