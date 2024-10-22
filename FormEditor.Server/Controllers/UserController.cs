using FormEditor.Server.Models;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using FormEditor.Server.Services;

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
    public async Task<ActionResult<UserViewModel>> CurrentUser()
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _userService.GetUserAsync(currentUserId);
        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }

    [HttpGet]
    public async Task<ActionResult<TableData<List<UserViewModel>>>> GetAllUsers([FromQuery] TableOptionViewModel option)
    {
        var result = await _userService.GetAllUsersAsync(option);
        
        return Ok(result);
    }

    [HttpGet("{userId:int}")]
    public async Task<ActionResult<UserViewModel>> GetUser([FromRoute] int userId)
    {
        var result = await _userService.GetUserAsync(userId);
        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
    
    [HttpPatch("{userId:int}/{action}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> PerformAction([FromRoute] ActionViewModel action, [FromRoute] int userId)
    {
        var result = await _userService.PerformActionAsync(action, userId);
        if (result.IsOk)
        {
            return NoContent();
        }

        return result.Error.IntoRespose();
    }
    
    [HttpPatch("{action}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> PerformBulkAction([FromRoute] ActionViewModel action, [FromBody] BulkViewModel bulk)
    {
        var result = await _userService.PerformBulkActionAsync(action, bulk.Ids);
        if (result.IsOk)
        {
            return NoContent();
        }

        return result.Error.IntoRespose();
    }

    [HttpPatch("{userId:int}/role/{role}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> ChangeRole([FromRoute] int userId, [FromRoute] RoleViewModel role)
    {
        var result = await _userService.ChangeRoleAsync(userId, role);
        if (result.IsOk)
        {
            return NoContent();
        }

        return result.Error.IntoRespose();
    }

    [HttpPatch("{userId:int}")]
    [Authorize]
    public async Task<ActionResult<UserViewModel>> UpdateUser([FromRoute] int userId, [FromBody] UpdateUserViewModel user)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _userService.UpdateUserAsync(userId, user, currentUserId);
        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }

}