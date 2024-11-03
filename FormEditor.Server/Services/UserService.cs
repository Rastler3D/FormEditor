using AutoMapper;
using FormEditor.Server.Models;
using FormEditor.Server.Repositories;
using FormEditor.Server.Utils;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Identity;

namespace FormEditor.Server.Services;

public interface IUserService
{
    Task<TableData<List<UserViewModel>>> GetAllUsersAsync(TableOptionViewModel option);
    Task<Result<UserViewModel, Error>> GetUserAsync(int userId);
    Task<Result<Error>> PerformBulkActionAsync(BulkViewModel bulk);
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

    public async Task<TableData<List<UserViewModel>>> GetAllUsersAsync(TableOptionViewModel options)
    {
        return (await _userRepository.GetAllUsersAsync(_mapper.Map<TableOption>(options)))
            .MapData(x => x
                .Select(_mapper.Map<UserViewModel>)
                .ToList()
            );
    }

    public async Task<Result<UserViewModel, Error>> GetUserAsync(int userId)
    {
        return (await _userRepository.GetUserAsync(userId))
            .Map(_mapper.Map<UserViewModel>);
    }

    public async Task<Result<Error>> PerformBulkActionAsync(BulkViewModel bulk)
    {
        foreach (var userId in bulk.Ids)
        {
            var result = await PerformActionAsync(bulk.Action, userId);
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

    public async Task<Result<UserViewModel, Error>> UpdateUserAsync(int userId, UpdateUserViewModel updateUser,
        int updatorId)
    {
        var updator = await _userRepository.GetUserAsync(updatorId);
        if (updator.IsErr)
        {
            return updator.Error;
        }

        var user = await _userRepository.GetUserAsync(userId);
        if (user.IsErr)
        {
            return user.Error;
        }

        if (updatorId != userId && !await _userManager.IsInRoleAsync(updator.Value, Roles.Admin))
        {
            return Error.Unauthorized("You have no permission to edit this profile");
        }

        if (updateUser.Email != null)
        {
            user.Value.Email = updateUser.Email;
            user.Value.Name = updateUser.Email;
        }

        if (updateUser.Name != null)
        {
            user.Value.Name = updateUser.Name;
        }

        if (updateUser.Avatar != null)
        {
            user.Value.Avatar = updateUser.Avatar;
        }

        return (await _userRepository.UpdateUserAsync(user.Value))
            .Map(_mapper.Map<UserViewModel>);
    }
}