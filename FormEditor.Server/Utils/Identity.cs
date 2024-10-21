using System.Security.Claims;

namespace FormEditor.Server.Models;

public static class Identity
{
    public const string DefaultUserName = "Admin";
    public const string DefaultEmail = "admin@gmail.com";
    public const string DefaultPassword = "Qwerty123";
    public static TimeSpan BlockDuration = TimeSpan.FromDays(255);

    public static int GetUserId(this ClaimsPrincipal principal)
    {
        return int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value);
    }
}

public static class Roles
{
    public const string Admin = "Admin";
    public const string User = "User";
}