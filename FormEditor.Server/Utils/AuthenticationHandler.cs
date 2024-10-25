using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace FormEditor.Server.Utils;

sealed class AuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
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
        return bearerResult;
    }

    protected override Task HandleSignInAsync(ClaimsPrincipal user, AuthenticationProperties? properties)
    {
        return Context.SignInAsync(IdentityConstants.BearerScheme,user);
    }

    protected override Task HandleSignOutAsync(AuthenticationProperties? properties)
    {
        return Context.SignOutAsync(IdentityConstants.BearerScheme, properties);
    }
    
    public new const string Scheme = "Identity.BearerWithExpirationError"; 
}