using FormEditor.Server.Models;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using FormEditor.Server.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace FormEditor.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    
    public UserController(IUserService userService)
    {
        _userService = userService;
    }
    [HttpGet("me")]
    [Authorize]
    public async Task<Results<Ok<UserViewModel>, ProblemHttpResult>> CurrentUser()
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _userService.GetUserAsync(currentUserId);
        if (result.IsOk)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }

    [HttpGet]
    public async Task<Ok<TableData<List<UserViewModel>>>> GetAllUsers([FromQuery] TableOptionViewModel option)
    {
        var result = await _userService.GetAllUsersAsync(option);
        
        return TypedResults.Ok(result);
    }

    [HttpGet("{userId:int}")]
    public async Task<Results<Ok<UserViewModel>,ProblemHttpResult>> GetUser([FromRoute] int userId)
    {
        var result = await _userService.GetUserAsync(userId);
        if (result.IsOk)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
    
    [HttpPatch("{userId:int}/{action}")]
    [Authorize(Roles = "Admin")]
    public async Task<Results<NoContent, ProblemHttpResult>> PerformAction([FromRoute] ActionViewModel action, [FromRoute] int userId)
    {
        var result = await _userService.PerformActionAsync(action, userId);
        if (result.IsOk)
        {
            return TypedResults.NoContent();
        }

        return result.Error.IntoRespose();
    }
    
    [HttpPatch("{action}")]
    [Authorize(Roles = "Admin")]
    public async Task<Results<NoContent, ProblemHttpResult>> PerformBulkAction([FromRoute] ActionViewModel action, [FromBody] BulkViewModel bulk)
    {
        var result = await _userService.PerformBulkActionAsync(action, bulk.Ids);
        if (result.IsOk)
        {
            return TypedResults.NoContent();
        }

        return result.Error.IntoRespose();
    }

    [HttpPatch("{userId:int}/role/{role}")]
    [Authorize(Roles = "Admin")]
    public async Task<Results<NoContent, ProblemHttpResult>> ChangeRole([FromRoute] int userId, [FromRoute] RoleViewModel role)
    {
        var result = await _userService.ChangeRoleAsync(userId, role);
        if (result.IsOk)
        {
            return TypedResults.NoContent();
        }

        return result.Error.IntoRespose();
    }

    [HttpPatch("{userId:int}")]
    [Authorize]
    public async Task<Results<Ok<UserViewModel>, ProblemHttpResult>> UpdateUser([FromRoute] int userId, [FromBody] UpdateUserViewModel user)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _userService.UpdateUserAsync(userId, user, currentUserId);
        if (result.IsOk)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }

}