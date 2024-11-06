using FormEditor.Server.Models;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FormEditor.Server.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace FormEditor.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TemplateController: ControllerBase
{
    private readonly ITemplateService _templateService;
    

    public TemplateController(ITemplateService templateService)
    {
        _templateService = templateService;
    }
    
    [HttpGet("user/{userId:int}")]
    public async Task<Ok<TableData<List<TemplateViewModel>>>> GetUserTemplates([FromRoute] int userId, [FromQuery] TableOptionViewModel options)
    {
        var result = await _templateService.GetUserTemplatesAsync(userId, options);
        
        return TypedResults.Ok(result);
    }
    
    [HttpGet]
    public async Task<Ok<TableData<List<TemplateViewModel>>>> GetTemplates([FromQuery] TableOptionViewModel options)
    {
        var result = await _templateService.GetTemplatesAsync(options);
        
        return TypedResults.Ok(result);
    }
    
    [HttpGet("latest")]
    public async Task<Ok<List<TemplateInfoViewModel>>> GetLatestTemplates()
    {
        var result = await _templateService.GetLatestTemplatesAsync();
        
        return TypedResults.Ok(result);
    }
    
    [HttpGet("popular")]
    public async Task<Ok<List<TemplateInfoViewModel>>> GetPopularTemplates()
    {
        var result = await _templateService.GetPopularTemplatesAsync();
        
        return TypedResults.Ok(result);
    }
    [HttpGet("tags/stat")]
    public async Task<Ok<List<TagInfo>>> GetTagsInfo()
    {
        var result = await _templateService.GetTagsInfoAsync();
        
        return TypedResults.Ok(result);
    }
    [HttpGet("tags")]
    public async Task<Ok<List<string>>> GetTags()
    {
        var result = await _templateService.GetTagsAsync();
        
        return TypedResults.Ok(result);
    }
    [HttpGet("topics")]
    public async Task<Ok<List<string>>> GetTopics()
    {
        var result = await _templateService.GetTopicsAsync();
        
        return TypedResults.Ok(result);
    }
    [HttpPost]
    [Authorize]
    public async Task<Results<Ok<TemplateInfoViewModel>, ProblemHttpResult>> CreateTemplate([FromBody] TemplateConfigurationViewModel template){
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.CreateTemplateAsync(template, currentUserId);
        
        if (result.IsOk)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
    
    [HttpPut("{templateId:int}")]
    [Authorize]
    public async Task<Results<Ok<TemplateViewModel>, ProblemHttpResult>> UpdateTemplate([FromRoute] int templateId, [FromBody] TemplateConfigurationViewModel template){
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.UpdateTemplateAsync(templateId, template, currentUserId);
        
        if (result.IsOk)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
    
    [HttpGet("{templateId:int}")]
    public async Task<Results<Ok<TemplateViewModel>, ProblemHttpResult>> GetTemplate([FromRoute] int templateId)
    {
        var result = await _templateService.GetTemplateAsync(templateId);
        
        if (result.IsOk)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
    [HttpPut("{templateId:int}/likes/toggle")]
    [Authorize]
    public async Task<Results<Ok<LikesInfo>,ProblemHttpResult>> ToggleLike([FromRoute] int templateId)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.ToggleLikeAsync(templateId, currentUserId);
        
        if (result.IsOk)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
    
    [HttpGet("{templateId:int}/likes")]
    public async Task<Ok<LikesInfo>> GetLikes([FromRoute] int templateId)
    {
        var currentUserId = HttpContext.User.Identity.IsAuthenticated? HttpContext.User?.GetUserId() : null;
        var result = await _templateService.GetLikesAsync(templateId, currentUserId);
        
        return TypedResults.Ok(result);
        
    }
    
    [HttpDelete("{templateId:int}")]
    [Authorize]
    public async Task<Results<NoContent, ProblemHttpResult>> DeleteTemplate([FromRoute] int templateId)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.DeleteTemplateAsync(templateId, currentUserId);
        
        if (result.IsOk)
        {
            return TypedResults.NoContent();
        }

        return result.Error.IntoRespose();
    }
    
    [HttpGet("{templateId:int}/aggregation")]
    public async Task<Ok<AggregatedResults>> GetAggregatedResults([FromRoute] int templateId)
    {
        var result = await _templateService.GetAggregatedResultsAsync(templateId);
        
        return TypedResults.Ok(result);
    }
    
    [HttpGet("{templateId:int}/comments")]
    public async Task<Ok<List<CommentViewModel>>> GetComments([FromRoute] int templateId)
    {
        var result = await _templateService.GetCommentsAsync(templateId);
        
        return TypedResults.Ok(result);
    }
    [HttpPost("{templateId:int}/comments")]
    [Authorize]
    public async Task<Results<Ok<CommentViewModel>, ProblemHttpResult>> AddComment([FromRoute] int templateId, [FromBody] string text)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.AddCommentAsync(templateId, currentUserId, text);
        
        if (result.IsOk)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
}