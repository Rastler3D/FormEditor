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
    
    [HttpGet("/latest")]
    public async Task<ActionResult<List<TemplateInfoViewModel>>> GetLatestTemplatesAsync()
    {
        var result = await _templateService.GetLatestTemplatesAsync();
        
        return Ok(result);
    }
    
    [HttpGet("/popular")]
    public async Task<ActionResult<List<TemplateInfoViewModel>>> GetPopularTemplatesAsync()
    {
        var result = await _templateService.GetPopularTemplatesAsync();
        
        return Ok(result);
    }
    [HttpGet("/tags/stat")]
    public async Task<ActionResult<List<TagInfo>>> GetTagsInfoAsync()
    {
        var result = await _templateService.GetTagsInfoAsync();
        
        return Ok(result);
    }
    [HttpGet("/tags")]
    public async Task<ActionResult<List<string>>> GetTagsAsync()
    {
        var result = await _templateService.GetTagsAsync();
        
        return Ok(result);
    }
    [HttpGet("/topics")]
    public async Task<ActionResult<List<string>>> GetTopicsAsync()
    {
        var result = await _templateService.GetTopicsAsync();
        
        return Ok(result);
    }
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<TemplateInfoViewModel>> CreateTemplateAsync([FromBody] TemplateConfigurationViewModel template){
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
    public async Task<ActionResult<TemplateInfoViewModel>> UpdateTemplateAsync([FromRoute] int templateId, [FromBody] TemplateConfigurationViewModel template){
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.UpdateTemplateAsync(templateId, template, currentUserId);
        
        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
    
    [HttpGet("{templateId:int}")]
    public async Task<ActionResult<TemplateViewModel>> GetTemplateAsync([FromRoute] int templateId)
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
    public async Task<ActionResult<LikesInfo>> ToggleLikeAsync([FromRoute] int templateId)
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
    public async Task<ActionResult<LikesInfo>> GetLikesAsync([FromRoute] int templateId)
    {
        var currentUserId = HttpContext.User.Identity.IsAuthenticated? HttpContext.User?.GetUserId() : null;
        var result = await _templateService.GetLikesAsync(templateId, currentUserId);
        
        return Ok(result);
        
    }
    
    [HttpDelete("{templateId:int}")]
    [Authorize]
    public async Task<ActionResult> DeleteTemplateAsync([FromRoute] int templateId)
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
    public async Task<ActionResult<AggregatedResults>> GetAggregatedResultsAsync([FromRoute] int templateId)
    {
        var result = await _templateService.GetAggregatedResultsAsync(templateId);
        
        return Ok(result);
    }
    
    [HttpGet("{templateId:int}/comments")]
    public async Task<ActionResult<List<CommentViewModel>>> GetComments([FromRoute] int templateId)
    {
        var result = await _templateService.GetComments(templateId);
        
        return Ok(result);
    }
    [HttpPost("{templateId:int}/comments")]
    [Authorize]
    public async Task<ActionResult<CommentViewModel>> AddComment([FromRoute] int templateId, [FromBody] string text)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _templateService.AddComment(templateId, currentUserId, text);
        
        return Ok(result);
    }
}