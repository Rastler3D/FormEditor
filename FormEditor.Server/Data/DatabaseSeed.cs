using FormEditor.Server.Models;
using Microsoft.AspNetCore.Identity;


namespace FormEditor.Server.Data;

public class DatabaseSeed
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        AppDbContext dbContext = serviceProvider.GetRequiredService<AppDbContext>();
        if (await dbContext.Database.EnsureCreatedAsync())
        {
            UserManager<User> userManager = serviceProvider.GetRequiredService<UserManager<User>>();
            RoleManager<IdentityRole> roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            await roleManager.CreateAsync(new IdentityRole(Roles.Admin));
            await roleManager.CreateAsync(new IdentityRole(Roles.User));

            var adminUser = new User
            {
                UserName = DefaultIdentity.DefaultUserName,
                Email = DefaultIdentity.DefaultEmail,
                EmailConfirmed = true,
            };

            // Add new user and their role
            await userManager.CreateAsync(adminUser, DefaultIdentity.DefaultPassword);
            adminUser = await userManager.FindByEmailAsync(DefaultIdentity.DefaultEmail);
            await userManager.AddToRoleAsync(adminUser, Roles.Admin);
        }
    }
}