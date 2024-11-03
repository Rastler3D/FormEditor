using Microsoft.AspNetCore.Identity;

namespace FormEditor.Server.Models;

public class User : IdentityUser<int>
{
    public string Name { get; set; }
    public string? Avatar { get; set; }
    public List<Template> Templates { get; set; }
    public List<Form> Forms { get; set; }
    public List<IdentityRole<int>> Roles { get; set; }
    
    public string? SalesforceContact { get; set; } 
    
}