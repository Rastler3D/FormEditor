﻿using FormEditor.Server.Models;
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
        RoleManager<IdentityRole<int>> roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();

        await roleManager.CreateAsync(new IdentityRole<int>(Roles.Admin));
        await roleManager.CreateAsync(new IdentityRole<int>(Roles.User));

        var adminUser = new User
        {
            Name = Identity.DefaultUserName,
            UserName = Identity.DefaultEmail,
            Email = Identity.DefaultEmail,
            EmailConfirmed = true,
        };

        // Add new user and their role
        var result = await userManager.CreateAsync(adminUser, Identity.DefaultPassword);
        if (result.Succeeded)
        {
            adminUser = await userManager.FindByEmailAsync(Identity.DefaultEmail);
            await userManager.AddToRoleAsync(adminUser, Roles.Admin);
        }
        else
        {
            throw new Exception(result.Errors.First().Description);
        }
        
    }
}