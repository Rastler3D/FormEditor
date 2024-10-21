using Microsoft.AspNetCore.Identity;

namespace FormEditor.Server.Models;

public class User : IdentityUser<int>
{
    public string? Avatar { get; set; }
    public List<Template> Templates { get; set; }
    public List<Form> Forms { get; set; }
    public List<IdentityRole<int>> Roles { get; set; }
    
}

public static class DefaultIdentity
{
    public const string DefaultUserName = "Admin";
    public const string DefaultEmail = "admin@gmail.com";
    public const string DefaultPassword = "Qwerty123";
    public static TimeSpan BlockDuration = TimeSpan.FromDays(255); 
}

public static class Roles
{
    public const string Admin = "Admin";
    public const string User = "User";
}