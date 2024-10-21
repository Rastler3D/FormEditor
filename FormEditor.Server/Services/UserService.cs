using AutoMapper;
using FormEditor.Server.Models;
using FormEditor.Server.Repositories;
using FormEditor.Server.Utils;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Identity;

namespace FormEditor.Server.Services;

public interface IUserService
{
    Task<List<UserViewModel>> GetAllUsersAsync(TableOption option);
    Task<Result<UserViewModel, Error>> GetUserAsync(int userId);
    Task<Result<Error>> PerformBulkActionAsync(ActionViewModel action, int[] userIds);
    Task<Result<Error>> PerformActionAsync(ActionViewModel action, int userId);
    Task<Result<Error>> ChangeRoleAsync(int userId, RoleViewModel role);
    Task<Result<UserViewModel, Error>> UpdateUserAsync(int userId, UpdateUserViewModel user, int updatorId);
}

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly UserManager<User> _userManager;

    public UserService(IUserRepository userRepository, IMapper mapper, UserManager<User> userManager)
    {
        _userRepository = userRepository;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<List<UserViewModel>> GetAllUsersAsync(TableOption option)
    {
        return (await _userRepository.GetAllUsersAsync(option))
            .Select(_mapper.Map<UserViewModel>)
            .ToList();
    }

    public async Task<Result<UserViewModel,Error>> GetUserAsync(int userId)
    {
        return (await _userRepository.GetUserAsync(userId))
            .Map(_mapper.Map<UserViewModel>);
    }

    public async Task<Result<Error>> PerformBulkActionAsync(ActionViewModel action, int[] userIds)
    {
        foreach (var userId in userIds)
        {
            var result = await PerformActionAsync(action, userId);
            if (result.IsErr)
            {
                return result;
            }
        }

        return Result<Error>.Ok();
    }

    public async Task<Result<Error>> PerformActionAsync(ActionViewModel action, int userId)
    {
        var result = action switch
        {
            ActionViewModel.Block => await _userRepository.BlockUserAsync(userId),
            ActionViewModel.Unblock => await _userRepository.UnblockUserAsync(userId),
            ActionViewModel.Delete => await _userRepository.DeleteUserAsync(userId),
        };
        
        return result;
    }

    public async Task<Result<Error>> ChangeRoleAsync(int userId, RoleViewModel role)
    {
        if (role == RoleViewModel.Admin)
        {
            return await _userRepository.AddAdminAsync(userId);
        }
        return await _userRepository.RemoveAdminAsync(userId);
    }

    public async Task<Result<UserViewModel,Error>> UpdateUserAsync(int userId, UpdateUserViewModel updateUser, int updatorId)
    {
        
        var user = await _userRepository.GetUserAsync(userId);
        if (user.IsErr)
        {
            return user.Error;
        }

        if (updatorId != userId)
        {
            return Error.Unauthorized("You have no permission to edit this profile");
        }
        
        if (updateUser.Email != null)
        {
            user.Value.Email = updateUser.Email;
        }

        if (updateUser.Name != null)
        {
            user.Value.UserName = updateUser.Email;
        }
        
        if (updateUser.Avatar != null)
        {
            user.Value.Avatar = updateUser.Email;
        }
        
        return (await _userRepository.UpdateUserAsync(user.Value))
            .Map(_mapper.Map<UserViewModel>);
    }
}