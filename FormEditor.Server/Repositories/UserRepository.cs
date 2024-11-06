using FormEditor.Server.Models;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using FormEditor.Server.Utils;
using FormEditor.Server.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace FormEditor.Server.Repositories;

public interface IUserRepository
{
    Task<TableData<List<User>>> GetAllUsersAsync(TableOption option);
    Task<Result<User, Error>> GetUserAsync(int userId);
    Task<Result<Error>> DeleteUserAsync(int userId);
    Task<Result<Error>> BlockUserAsync(int userId);
    Task<Result<Error>> UnblockUserAsync(int userId);
    Task<Result<Error>> AddAdminAsync(int userId);
    Task<Result<Error>> RemoveAdminAsync(int userId);
    Task<Result<User, Error>> UpdateUserAsync(User user);
}

public class UserRepository : IUserRepository
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager;

    public UserRepository(UserManager<User> userManager, RoleManager<IdentityRole<int>> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<TableData<List<User>>> ApplyTableOptions(IQueryable<User> users, TableOption options)
    {
        if (!String.IsNullOrWhiteSpace(options.Filter))
        {
            users = users.Where(f =>
                EF.Functions.ILike(f.Name, $"%{options.Filter}%") ||
                EF.Functions.ILike(f.Email, $"%{options.Filter}%")
            );
        }
        var totalRows = await users.CountAsync();

        foreach (var sortOption in options.Sort)
        {
            Expression<Func<User, object>> selector = sortOption.Id switch
            {
                "name" => x => x.Name,
                "email" => x => x.Email,
                "role" => x => x.Roles.Count,
                "status" => x => x.LockoutEnabled,
                _ => x => x.Id
            };

            if (sortOption.Desc)
            {
                users = users.OrderByDescending(selector);
            }
            else
            {
                users = users.OrderBy(selector);
            }
        }

        if (options.Pagination.PageSize >= 0)
        {
            users = users.Skip(options.Pagination.PageSize * options.Pagination.PageIndex)
                .Take(options.Pagination.PageSize);
        }

        return new()
        {
            Data = await users.ToListAsync(),
            TotalRows = totalRows
        };
    }

    public async Task<TableData<List<User>>> GetAllUsersAsync(TableOption option)
    {
        var users = _userManager.Users.Include(x => x.Roles);
        return await ApplyTableOptions(users, option);
    }

    public async Task<Result<User, Error>> GetUserAsync(int userId)
    {
        var user = await _userManager.Users
            .Include(x => x.Roles)
            .FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null)
        {
            return Error.NotFound("User not found");
        }

        return user;
    }

    public async Task<Result<Error>> DeleteUserAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return Error.NotFound("User not found");
        }

        var result = await _userManager.DeleteAsync(user);
        if (result.Succeeded)
        {
            return Result<Error>.Ok();
        }

        return Error.InternalError(result.Errors.First().Description);
    }

    public async Task<Result<Error>> BlockUserAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return Error.NotFound("User not found");
        }

        var result = await _userManager.SetLockoutEnabledAsync(user, true);
        if (result.Succeeded)
        {
            result = await _userManager.SetLockoutEndDateAsync(user,
                new DateTimeOffset(DateTime.UtcNow + Identity.BlockDuration));
        }

        if (result.Succeeded)
        {
            return Result<Error>.Ok();
        }

        return Error.InternalError(result.Errors.First().Description);
    }

    public async Task<Result<Error>> UnblockUserAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return Error.NotFound("User not found");
        }

        var result = await _userManager.SetLockoutEndDateAsync(user, null);

        if (result.Succeeded)
        {
            result = await _userManager.SetLockoutEnabledAsync(user, false);
        }

        if (result.Succeeded)
        {
            return Result<Error>.Ok();
        }

        return Error.InternalError(result.Errors.First().Description);
    }

    public async Task<Result<Error>> AddAdminAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return Error.NotFound("User not found");
        }


        var result = await _userManager.AddToRoleAsync(user, Roles.Admin);
        if (result.Succeeded)
        {
            return Result<Error>.Ok();
        }

        return Error.InternalError(result.Errors.First().Description);
    }

    public async Task<Result<Error>> RemoveAdminAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return Error.NotFound("User not found");
        }


        var result = await _userManager.RemoveFromRoleAsync(user, Roles.Admin);
        if (result.Succeeded)
        {
            return Result<Error>.Ok();
        }

        return Error.InternalError(result.Errors.First().Description);
    }

    public async Task<Result<User, Error>> UpdateUserAsync(User user)
    {
        var result = await _userManager.UpdateAsync(user);
        if (result.Succeeded)
        {
            return user;
        }

        return Error.InternalError(result.Errors.First().Description);
    }
}