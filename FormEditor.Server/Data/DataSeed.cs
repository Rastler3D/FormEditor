using FormEditor.Server.Models;
using FormEditor.Server.Utils;
using Microsoft.AspNetCore.Identity;
using FormEditor.Server.Services;


namespace FormEditor.Server.Data;

public static class DataSeed
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        AppDbContext dbContext = serviceProvider.GetRequiredService<AppDbContext>();
        if (await dbContext.Database.EnsureCreatedAsync())
        {
            await SeedDB(serviceProvider);
            await SeedSearchService(serviceProvider);
        }
    }

    private static async Task SeedSearchService(IServiceProvider serviceProvider)
    {
        ISearchService searchService = serviceProvider.GetRequiredService<ISearchService>();
        await searchService.Initialize();
    }
    private static async Task SeedDB(IServiceProvider serviceProvider)
    {
        UserManager<User> userManager = serviceProvider.GetRequiredService<UserManager<User>>();
        RoleManager<IdentityRole> roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        await roleManager.CreateAsync(new IdentityRole(Roles.Admin));
        await roleManager.CreateAsync(new IdentityRole(Roles.User));

        var adminUser = new User
        {
            UserName = Identity.DefaultUserName,
            Email = Identity.DefaultEmail,
            EmailConfirmed = true,
        };

        // Add new user and their role
        await userManager.CreateAsync(adminUser, Identity.DefaultPassword);
        adminUser = await userManager.FindByEmailAsync(Identity.DefaultEmail);
        await userManager.AddToRoleAsync(adminUser, Roles.Admin);
    }
}