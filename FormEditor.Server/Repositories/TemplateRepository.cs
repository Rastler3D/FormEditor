﻿using System.Linq.Expressions;
using AutoMapper;
using EntityFramework.Exceptions.Common;
using FormEditor.Server.Utils;
using FormEditor.Server.Data;
using FormEditor.Server.Models;
using FormEditor.Server.ViewModels;
using Microsoft.EntityFrameworkCore;
using NuGet.Packaging;

namespace FormEditor.Server.Repositories;

// Repositories/ITemplateRepository.cs
public interface ITemplateRepository
{
    Task<Result<bool, Error>> GetTemplateIsAllowedAsync(int templateId, int userId);
    Task<List<Template>> GetLatestTemplatesAsync();
    Task<List<Template>> GetPopularTemplatesAsync();
    Task<TableData<List<Template>>> GetTemplatesAsync(TableOption option);
    Task<TableData<List<Template>>> GetUserTemplatesAsync(int userId, TableOption option);
    Task<Result<Template, Error>> GetTemplateAsync(int id);
    Task<Result<Template, Error>> GetTemplateWithQuestionsAsync(int id);
    Task<Result<Template, Error>> CreateTemplateAsync(Template template);
    Task<Result<Template, Error>> UpdateTemplateAsync(Template template);
    Task<Result<Error>> DeleteTemplateAsync(int id);
    Task<List<Comment>> GetCommentsAsync(int templateId);
    Task<Result<Comment, Error>> AddCommentAsync(int templateId, int authorId, string text);
    Task<List<TagInfo>> GetTagsInfoAsync();
    Task<List<Tag>> GetTagsAsync();
    Task<List<Topic>> GetTopicsAsync();
    Task<int> GetLikesCountAsync(int templateId);
    Task<bool> GetIsLikedAsync(int templateId, int userId);
    Task<LikesInfo> ToggleLikeAsync(int templateId, int userId);
    Task<AggregatedResults> GetAggregatedResultsAsync(int templateId);
}

// Repositories/TemplateRepository.cs
public class TemplateRepository : ITemplateRepository
{
    private readonly AppDbContext _context;

    public TemplateRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TableData<List<Template>>> ApplyTableOptions(IQueryable<Template> templates, TableOption options)
    {
        if (!String.IsNullOrWhiteSpace(options.Filter))
        {
            templates = templates.Where(f =>
                EF.Functions.ILike(f.Name, $"%{options.Filter}%") ||
                EF.Functions.ILike(f.Topic.Name, $"%{options.Filter}%") ||
                EF.Functions.ILike(f.Description, $"%{options.Filter}%") ||
                EF.Functions.ILike(f.Creator.Name, $"%{options.Filter}%")
            );
        }

        var totalRows = await templates.CountAsync();
        foreach (var sortOption in options.Sort)
        {
            Expression<Func<Template, object>> selector = sortOption.Id switch
            {
                "topic" => x => x.Topic.Name,
                "name" => x => x.Name,
                "createdBy" => x => x.Creator.Name,
                "createdAt" => x => x.CreatedAt,
                "filledCount" => x => x.FilledCount,
                _ => x => x.Id
            };

            if (sortOption.Desc)
            {
                templates = templates.OrderByDescending(selector);
            }
            else
            {
                templates = templates.OrderBy(selector);
            }
        }
        if (options.Pagination.PageSize >= 0)
        {
            templates = templates.Skip(options.Pagination.PageSize * options.Pagination.PageIndex)
                .Take(options.Pagination.PageSize);
        }
        
        return new()
        {
            Data = await templates.ToListAsync(),
            TotalRows = totalRows
        };
    }

    private IQueryable<Template> LoadProperties(IQueryable<Template> template)
    {
        return template
            .Include(t => t.AllowList)
            .Include(t => t.Tags)
            .Include(t => t.Topic)
            .Include(t => t.Likes)
            .Include(t => t.Creator);
    }

    public async Task<Result<bool, Error>> GetTemplateIsAllowedAsync(int templateId, int userId)
    {
        var isAllowed = await _context.Templates.FindAsync(templateId);

        if (isAllowed == null)
        {
            return Error.NotFound("Template not found");
        }

        if (isAllowed.AccessSetting == AccessSetting.All)
        {
            return true;
        }

        var allowEntry = await _context.AllowList
            .FirstOrDefaultAsync(x => x.TemplateId == templateId && x.UserId == userId);

        return allowEntry != null;
    }

    public async Task<TableData<List<Template>>> GetTemplatesAsync(TableOption option)
    {
        var template = LoadProperties(_context.Templates)
            .Include(t => t.Questions);

        return await ApplyTableOptions(template, option);
    }

    public async Task<TableData<List<Template>>> GetUserTemplatesAsync(int userId, TableOption option)
    {
        var template = LoadProperties(_context.Templates)
            .Include(t => t.Questions)
            .Where(t => t.CreatorId == userId);


        return await ApplyTableOptions(template, option);
    }


    public async Task<Result<Template, Error>> GetTemplateAsync(int id)
    {
        var template = await LoadProperties(_context.Templates)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (template == null)
        {
            return Error.NotFound("Template not found.");
        }

        return template;
    }

    public async Task<List<Template>> GetLatestTemplatesAsync()
    {
        return await LoadProperties(_context.Templates)
            .OrderByDescending(t => t.CreatedAt)
            .Take(10)
            .ToListAsync();
    }

    public async Task<List<Template>> GetPopularTemplatesAsync()
    {
        return await LoadProperties(_context.Templates)
            .OrderByDescending(t => t.FilledCount)
            .Take(10)
            .ToListAsync();
    }

    public async Task<Result<Template, Error>> GetTemplateWithQuestionsAsync(int id)
    {
        var template = await GetTemplateAsync(id);
        if (template.IsErr)
        {
            return template;
        }

        await _context.Entry(template.Value).Collection(t => t.Questions).LoadAsync();

        return template;
    }

    public async Task<Result<Template, Error>> CreateTemplateAsync(Template template)
    {
        template.Topic = await UpsertTopic(template.Topic);
        template.Tags = await UpsertTags(template.Tags);
        template.FilledCount = 0;
        template.CreatedAt = DateTime.Now;
        try
        {
            await _context.Templates.AddAsync(template);
            await _context.SaveChangesAsync();
        }
        catch (ReferenceConstraintException e) when (e.ConstraintName.Contains("User",
                                                         StringComparison.InvariantCultureIgnoreCase))
        {
            return Error.NotFound($"Referenced user not found.");
        }
        await _context.Entry(template).Reference(t => t.Creator).LoadAsync();
        
        return template;
    }

    public async Task<Result<Template, Error>> UpdateTemplateAsync(Template template)
    {
        var findingTemplate = await GetTemplateWithQuestionsAsync(template.Id);
        if (findingTemplate.IsErr)
        {
            return findingTemplate;
        }

        var existingTemplate = findingTemplate.Value;

        existingTemplate.Name = template.Name;
        existingTemplate.Description = template.Description;
        existingTemplate.AccessSetting = template.AccessSetting;
        existingTemplate.Image = template.Image;
        existingTemplate.Topic = await UpsertTopic(template.Topic);
        existingTemplate.Tags = await UpsertTags(template.Tags);
        existingTemplate.AllowList = template.AllowList;

        var existingQuestions = existingTemplate.Questions.ToDictionary(q => q.Id);

        foreach (var newQuestion in template.Questions)
        {
            if (existingQuestions.TryGetValue(newQuestion.Id, out var existingQuestion))
            {
                _context.Entry(existingQuestion).State = EntityState.Detached;
                _context.Attach(newQuestion);

                if (existingQuestion.Type != newQuestion.Type)
                {
                    _context.Entry(newQuestion).Collection(x => x.Answers).IsModified = true;
                    _context.Entry(newQuestion).Collection(x => x.Answers).CurrentValue = null;
                }
                else if (existingQuestion.Type == QuestionType.Select &&
                         !existingQuestion.Options.ToHashSet().IsSubsetOf(newQuestion.Options))
                {
                    await _context.Answers
                        .Where(a => a.QuestionId == existingQuestion.Id && !newQuestion.Options.Contains(a.StringValue))
                        .ExecuteDeleteAsync();
                }
            }
        }

        existingTemplate.Questions = template.Questions;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (ReferenceConstraintException e) when (e.ConstraintName.Contains("User",
                                                         StringComparison.InvariantCultureIgnoreCase))
        {
            return Error.NotFound($"Referenced user not found.");
        }

        return existingTemplate;
    }

    public async Task<Result<Error>> DeleteTemplateAsync(int id)
    {
        var template = await _context.Templates.FindAsync(id);
        if (template == null)
        {
            return Error.NotFound("Template not found.");
        }

        _context.Templates.Remove(template);
        await _context.SaveChangesAsync();

        return Result<Error>.Ok();
    }


    public async Task<HashSet<Tag>> UpsertTags(HashSet<Tag> tags)
    {
        var tagNames = tags.Select(t => t.Name).ToList();
        var existingTags = await _context.Tags
            .Where(t => tagNames.Contains(t.Name))
            .ToHashSetAsync();
        var newTags = tagNames
            .Except(existingTags.Select(t => t.Name))
            .Select(name => new Tag { Name = name })
            .ToHashSet();
        await _context.Tags.AddRangeAsync(newTags);
        await _context.SaveChangesAsync();
        existingTags.AddRange(newTags);

        return existingTags;
    }

    public async Task<Topic> UpsertTopic(Topic topic)
    {
        var topicName = topic.Name;
        var existingTopic = await _context.Topics
            .FirstOrDefaultAsync(t => t.Name == topicName);

        if (existingTopic == null)
        {
            await _context.Topics.AddAsync(topic);
            await _context.SaveChangesAsync();
            existingTopic = topic;
        }

        return existingTopic;
    }

    public async Task<List<TagInfo>> GetTagsInfoAsync()
    {
        var tagCounts = await _context.Tags
            .Include(x => x.Templates)
            .Select(t => new TagInfo { Name = t.Name, Count = t.Templates.Count })
            .ToListAsync();

        return tagCounts;
    }

    public async Task<List<Tag>> GetTagsAsync()
    {
        return await _context.Tags.ToListAsync();
    }

    public async Task<List<Topic>> GetTopicsAsync()
    {
        return await _context.Topics.ToListAsync();
    }

    public async Task<int> GetLikesCountAsync(int templateId)
    {
        var likes = await _context.Likes.Where(l => l.TemplateId == templateId).CountAsync();
        return likes;
    }

    public async Task<bool> GetIsLikedAsync(int templateId, int userId)
    {
        var like = await GetLikeAsync(templateId, userId);
        return like != null;
    }

    public async Task<Like?> GetLikeAsync(int templateId, int userId)
    {
        var like = await _context.Likes.FindAsync(templateId, userId);
        return like;
    }

    public async Task<LikesInfo> ToggleLikeAsync(int templateId, int userId)
    {
        var like = await GetLikeAsync(templateId, userId);
        var isLike = like != null;
        if (isLike)
        {
            _context.Likes.Remove(like);
        }
        else
        {
            await _context.Likes.AddAsync(new Like { TemplateId = templateId, UserId = userId });
        }

        await _context.SaveChangesAsync();
        var count = await GetLikesCountAsync(templateId);

        return new LikesInfo { Likes = count, IsLiked = !isLike };
    }

    public async Task<AggregatedResults> GetAggregatedResultsAsync(int templateId)
    {
        var aggregations = await _context.Questions
            .Include(t => t.Answers)
            .Where(q => q.TemplateId == templateId)
            .OrderBy(q => q.Order)
            .Select(q => new
            {
                Id = q.Id, Aggregation = new Aggregation
                {
                    AverageNumber = q.Type == QuestionType.Integer
                        ? q.Answers.Average(a => a.NumericValue)
                        : null,
                    MinNumber = q.Type == QuestionType.Integer
                        ? q.Answers.Min(a => a.NumericValue)
                        : null,
                    MaxNumber = q.Type == QuestionType.Integer
                        ? q.Answers.Max(a => a.NumericValue)
                        : null,
                    MostCommonText = q.Type == QuestionType.MultiLine | q.Type == QuestionType.SingleLine
                        ? q.Answers
                            .GroupBy(a => a.StringValue)
                            .OrderByDescending(g => g.Count())
                            .Select(g => g.Key)
                            .FirstOrDefault()
                        : null,
                    UniqueCountText = q.Type == QuestionType.MultiLine | q.Type == QuestionType.SingleLine
                        ? q.Answers
                            .Select(a => a.StringValue)
                            .Distinct()
                            .Count()
                        : null,
                    OptionCountsSelect = q.Type == QuestionType.Select
                        ? q.Options
                            .Select(option => new OptionPair
                            {
                                Option = option,
                                Count = q.Answers.Count(a =>
                                    a.StringValue == option) // Count answers matching each option
                            })
                            .ToArray()
                        : null,
                    TrueCountBoolean = q.Type == QuestionType.Checkbox
                        ? q.Answers
                            .Count(a => a.BooleanValue == true)
                        : null,
                    FalseCountBoolean = q.Type == QuestionType.Checkbox
                        ? q.Answers
                            .Count(a => a.BooleanValue == false)
                        : null,
                }
            }).ToDictionaryAsync(q => q.Id, q => q.Aggregation);

        return new AggregatedResults
        {
            Questions = aggregations,
        };
    }

    public async Task<List<Comment>> GetCommentsAsync(int templateId)
    {
        var comments = await _context.Comments
            .Include(c => c.Author)
            .Where(c => c.TemplateId == templateId)
            .OrderBy(c => c.Date)
            .ToListAsync();
        return comments;
    }

    public async Task<Result<Comment, Error>> AddCommentAsync(int templateId, int authorId, string text)
    {
        var comment = new Comment
        {
            Text = text,
            AuthorId = authorId,
            Date = DateTime.UtcNow,
            TemplateId = templateId
        };
        try
        {
            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();
        }
        catch (ReferenceConstraintException e) when (e.ConstraintName.Contains("Template",
                                                         StringComparison.InvariantCultureIgnoreCase) ||
                                                     e.ConstraintName.Contains("Author",
                                                         StringComparison.InvariantCultureIgnoreCase))
        {
            if (e.ConstraintName.Contains("Template", StringComparison.InvariantCultureIgnoreCase))
            {
                return Error.NotFound("Template not found");
            }

            return Error.NotFound("Author not found");
        }

        await _context.Entry(comment).Reference(x => x.Author).LoadAsync();
        return comment;
    }
}