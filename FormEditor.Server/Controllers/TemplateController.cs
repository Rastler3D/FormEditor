using FormEditor.Server.Models;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FormEditor.Server.Services;

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
    public async Task<ActionResult<TableData<List<TemplateInfoViewModel>>>> GetUserTemplates([FromRoute] int userId, [FromQuery] TableOptionViewModel options)
    {
        var result = await _templateService.GetUserTemplatesAsync(userId, options);
        
        return Ok(result);
    }
    
    [HttpGet]
    public async Task<ActionResult<TableData<List<TemplateInfoViewModel>>>> GetTemplates([FromQuery] TableOptionViewModel options)
    {
        var result = await _templateService.GetTemplatesAsync(options);
        
        return Ok(result);
    }
    
    [HttpGet("latest")]
    public async Task<ActionResult<List<TemplateInfoViewModel>>> GetLatestTemplates()
    {
        var result = await _templateService.GetLatestTemplatesAsync();
        
        return Ok(result);
    }
    
    [HttpGet("popular")]
    public async Task<ActionResult<List<TemplateInfoViewModel>>> GetPopularTemplates()
    {
        var result = await _templateService.GetPopularTemplatesAsync();
        
        return Ok(result);
    }
    [HttpGet("tags/stat")]
    public async Task<ActionResult<List<TagInfo>>> GetTagsInfo()
    {
        var result = await _templateService.GetTagsInfoAsync();
        
        return Ok(result);
    }
    [HttpGet("tags")]
    public async Task<ActionResult<List<string>>> GetTags()
    {
        var result = await _templateService.GetTagsAsync();
        
        return Ok(result);
    }
    [HttpGet("topics")]
    public async Task<ActionResult<List<string>>> GetTopics()
    {
        var result = await _templateService.GetTopicsAsync();
        
        return Ok(result);
    }
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<TemplateInfoViewModel>> CreateTemplate([FromBody] TemplateConfigurationViewModel template){
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.CreateTemplateAsync(template, currentUserId);
        
        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
    
    [HttpPut("{templateId:int}")]
    [Authorize]
    public async Task<ActionResult<TemplateViewModel>> UpdateTemplate([FromRoute] int templateId, [FromBody] TemplateConfigurationViewModel template){
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.UpdateTemplateAsync(templateId, template, currentUserId);
        
        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
    
    [HttpGet("{templateId:int}")]
    public async Task<ActionResult<TemplateViewModel>> GetTemplate([FromRoute] int templateId)
    {
        var result = await _templateService.GetTemplateAsync(templateId);
        
        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
    [HttpPut("{templateId:int}/likes/toggle")]
    [Authorize]
    public async Task<ActionResult<LikesInfo>> ToggleLike([FromRoute] int templateId)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.ToggleLikeAsync(templateId, currentUserId);
        
        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
    
    [HttpGet("{templateId:int}/likes")]
    public async Task<ActionResult<LikesInfo>> GetLikes([FromRoute] int templateId)
    {
        var currentUserId = HttpContext.User.Identity.IsAuthenticated? HttpContext.User?.GetUserId() : null;
        var result = await _templateService.GetLikesAsync(templateId, currentUserId);
        
        return Ok(result);
        
    }
    
    [HttpDelete("{templateId:int}")]
    [Authorize]
    public async Task<ActionResult> DeleteTemplate([FromRoute] int templateId)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.DeleteTemplateAsync(templateId, currentUserId);
        
        if (result.IsOk)
        {
            return NoContent();
        }

        return result.Error.IntoRespose();
    }
    
    [HttpGet("{templateId:int}/aggregation")]
    public async Task<ActionResult<AggregatedResults>> GetAggregatedResults([FromRoute] int templateId)
    {
        var result = await _templateService.GetAggregatedResultsAsync(templateId);
        
        return Ok(result);
    }
    
    [HttpGet("{templateId:int}/comments")]
    public async Task<ActionResult<List<CommentViewModel>>> GetComments([FromRoute] int templateId)
    {
        var result = await _templateService.GetCommentsAsync(templateId);
        
        return Ok(result);
    }
    [HttpPost("{templateId:int}/comments")]
    [Authorize]
    public async Task<ActionResult<CommentViewModel>> AddComment([FromRoute] int templateId, [FromBody] string text)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.AddCommentAsync(templateId, currentUserId, text);
        
        return Ok(result);
    }
}