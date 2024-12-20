﻿// Services/TemplateService.cs

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using FormEditor.Server.Data;
using FormEditor.Server.Models;
using FormEditor.Server.Repositories;
using FormEditor.Server.Utils;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Identity;

namespace FormEditor.Server.Services
{
    public interface ITemplateService
    {
        Task<List<TemplateInfoViewModel>> GetLatestTemplatesAsync();
        Task<List<TemplateInfoViewModel>> GetPopularTemplatesAsync();
        Task<List<TagInfo>> GetTagsInfoAsync();
        Task<List<string>> GetTagsAsync();
        Task<List<string>> GetTopicsAsync();
        Task<TableData<List<TemplateViewModel>>> GetTemplatesAsync(TableOptionViewModel option);
        Task<TableData<List<TemplateViewModel>>> GetUserTemplatesAsync(int userId, TableOptionViewModel option);

        Task<Result<TemplateInfoViewModel, Error>> CreateTemplateAsync(TemplateConfigurationViewModel template,
            int creatorId);

        Task<Result<TemplateViewModel, Error>> UpdateTemplateAsync(int templateId,
            TemplateConfigurationViewModel template, int updatorId);

        Task<Result<TemplateViewModel, Error>> GetTemplateAsync(int id);
        Task<Result<LikesInfo, Error>> ToggleLikeAsync(int templateId, int userId);
        Task<LikesInfo> GetLikesAsync(int templateId, int? userId);
        Task<Result<Error>> DeleteTemplateAsync(int id, int userId);
        Task<AggregatedResults> GetAggregatedResultsAsync(int templateId);
        Task<List<CommentViewModel>> GetCommentsAsync(int templateId);
        Task<Result<CommentViewModel, Error>> AddCommentAsync(int templateId, int authorId, string text);
    }

    public class TemplateService(
        ITemplateRepository templateRepository,
        UserManager<User> userManager,
        IMapper mapper,
        ISearchService searchService)
        : ITemplateService
    {

        public async Task<List<TemplateInfoViewModel>> GetLatestTemplatesAsync()
        {
            return (await templateRepository.GetLatestTemplatesAsync())
                .Select(mapper.Map<TemplateInfoViewModel>)
                .ToList();
        }

        public async Task<List<TemplateInfoViewModel>> GetPopularTemplatesAsync()
        {
            return (await templateRepository.GetPopularTemplatesAsync())
                .Select(mapper.Map<TemplateInfoViewModel>)
                .ToList();
        }


        public async Task<List<TagInfo>> GetTagsInfoAsync()
        {
            return await templateRepository.GetTagsInfoAsync();
        }

        public async Task<List<string>> GetTagsAsync()
        {
            return (await templateRepository.GetTagsAsync())
                .Select(x => x.Name)
                .ToList();
        }

        public async Task<List<string>> GetTopicsAsync()
        {
            return (await templateRepository.GetTopicsAsync())
                .Select(x => x.Name)
                .ToList();
        }

        public async Task<TableData<List<TemplateViewModel>>> GetTemplatesAsync(TableOptionViewModel options)
        {
            return (await templateRepository.GetTemplatesAsync(mapper.Map<TableOption>(options)))
                .MapData(x => x
                    .Select(mapper.Map<TemplateViewModel>)
                    .ToList()
                );
        }

        public async Task<TableData<List<TemplateViewModel>>> GetUserTemplatesAsync(int userId, TableOptionViewModel options)
        {
            return (await templateRepository.GetUserTemplatesAsync(userId, mapper.Map<TableOption>(options)))
                .MapData(x => x
                    .Select(mapper.Map<TemplateViewModel>)
                    .ToList()
                );
        }

        public async Task<Result<TemplateInfoViewModel, Error>> CreateTemplateAsync(
            TemplateConfigurationViewModel templateConfig, int creatorId)
        {
            var user = await userManager.FindByIdAsync(creatorId.ToString());
            if (user == null)
            {
                return Error.NotFound("User not found");
            }

            var template = mapper.Map<Template>(templateConfig, opt => opt.Items["CreatorId"] = creatorId);
            var templateCreation = await templateRepository.CreateTemplateAsync(template);

            if (templateCreation.IsErr)
            {
                return templateCreation.Error;
            }

            var createdTemplate = templateCreation.Value;

            await searchService.UpsertTemplateAsync(mapper.Map<TemplateViewModel>(createdTemplate));

            return mapper.Map<TemplateInfoViewModel>(createdTemplate);
        }

        public async Task<Result<TemplateViewModel, Error>> UpdateTemplateAsync(int templateId,
            TemplateConfigurationViewModel templateConfig, int updatorId)
        {
            var user = await userManager.FindByIdAsync(updatorId.ToString());

            var template = await templateRepository.GetTemplateAsync(templateId);
            if (template.IsErr)
            {
                return template.Error;
            }

            if (template.Value.CreatorId != user.Id && !await userManager.IsInRoleAsync(user, Roles.Admin))
            {
                return Error.Unauthorized("You have no permission to edit this template");
            }

            var newTemplate = mapper.Map<Template>(templateConfig, opt => opt.Items["TemplateId"] = templateId);
            var templateUpdate = await templateRepository.UpdateTemplateAsync(newTemplate);
            if (templateUpdate.IsErr)
            {
                return templateUpdate.Error;
            }

            var updatedTemplate = templateUpdate.Value;

            await searchService.UpsertTemplateAsync(mapper.Map<TemplateViewModel>(updatedTemplate));

            return mapper.Map<TemplateViewModel>(updatedTemplate);
        }

        public async Task<Result<TemplateViewModel, Error>> GetTemplateAsync(int id)
        {
            return (await templateRepository.GetTemplateWithQuestionsAsync(id))
                .Map(mapper.Map<TemplateViewModel>);
        }

        public async Task<Result<LikesInfo, Error>> ToggleLikeAsync(int templateId, int userId)
        {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return Error.NotFound("User not found");
            }

            return await templateRepository.ToggleLikeAsync(templateId, userId);
        }

        public async Task<LikesInfo> GetLikesAsync(int templateId, int? userId)
        {
            var likes = await templateRepository.GetLikesCountAsync(templateId);
            var isLiked = false;
            if (userId.HasValue)
            {
                isLiked = await templateRepository.GetIsLikedAsync(templateId, userId.Value);
            }

            return new LikesInfo
            {
                IsLiked = isLiked,
                Likes = likes
            };
        }

        public async Task<Result<Error>> DeleteTemplateAsync(int id, int userId)
        {
            var user = await userManager.FindByIdAsync(userId.ToString());

            var template = await templateRepository.GetTemplateAsync(id);
            if (template.IsErr)
            {
                return template.Error;
            }

            if (template.Value.CreatorId != user.Id && !await userManager.IsInRoleAsync(user, Roles.Admin))
            {
                return Error.Unauthorized("You have no permission to edit this template");
            }

            var templateDeletion = await templateRepository.DeleteTemplateAsync(id);
            if (templateDeletion.IsErr)
            {
                return templateDeletion;
            }

            await searchService.DeleteTemplateAsync(id);

            return Result<Error>.Ok();
        }

        public async Task<AggregatedResults> GetAggregatedResultsAsync(int templateId)
        {
            return await templateRepository.GetAggregatedResultsAsync(templateId);
        }

        public async Task<List<CommentViewModel>> GetCommentsAsync(int templateId)
        {
            return (await templateRepository.GetCommentsAsync(templateId))
                .Select(mapper.Map<CommentViewModel>)
                .ToList();
        }

        public async Task<Result<CommentViewModel, Error>> AddCommentAsync(int templateId, int authorId, string text)
        {
            return (await templateRepository.AddCommentAsync(templateId, authorId, text))
                .Map(mapper.Map<CommentViewModel>);
        }
    }
}