using FormEditor.Server.Models;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FormEditor.Server.Services;

namespace FormEditor.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FormController : ControllerBase
{
    private readonly IFormService _formService;

    public FormController(IFormService formService)
    {
        _formService = formService;
    }

    [HttpGet("template/{templateId:int}")]
    public async Task<ActionResult<TableData<List<FormViewModel>>>> GetSubmittedForms([FromRoute] int templateId, [FromQuery] TableOptionViewModel options)
    {
        var result = await _formService.GetSubmittedFormsAsync(templateId, options);

        return Ok(result);
    }

    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<TableData<List<FormInfoViewModel>>>> GetUserForms([FromRoute] int userId,
        [FromQuery] TableOptionViewModel options)
    {
        var result = await _formService.GetUserFormsAsync(userId, options);

        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<TableData<List<FormInfoViewModel>>>> GetForms([FromQuery] TableOptionViewModel options)
    {
        var result = await _formService.GetFormsAsync(options);

        return Ok(result);
    }

    [HttpGet("user/{userId:int}/template/{templateId:int}")]
    public async Task<ActionResult<FormViewModel>> GetSubmittedForm([FromRoute] int templateId, [FromRoute] int userId)
    {
        var result = await _formService.GetSubmittedFormAsync(templateId, userId);

        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }

    [HttpGet("{formId:int}")]
    public async Task<ActionResult<FormViewModel>> GetForm([FromRoute] int formId)
    {
        var result = await _formService.GetFormAsync(formId);

        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }

    [HttpGet("{formId:int}/full")]
    public async Task<ActionResult<FormWithQuestionViewModel>> GetFormWithTemplate([FromRoute] int formId)
    {
        var result = await _formService.GetFormWithTemplateAsync(formId);

        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<FormInfoViewModel>> SubmitForm([FromBody] FilledFormViewModel filledForm)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _formService.SubmitFormAsync(filledForm, currentUserId);

        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }

    [HttpPut("{formId:int}")]
    [Authorize]
    public async Task<ActionResult<FormInfoViewModel>> UpdateForm([FromRoute] int formId,
        [FromBody] FilledFormViewModel filledForm)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _formService.UpdateFormAsync(formId, filledForm, currentUserId);

        if (result.IsOk)
        {
            return Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }

    [HttpDelete("{formId:int}")]
    [Authorize]
    public async Task<ActionResult> DeleteForm([FromRoute] int formId)
    {
        var currentUserId = HttpContext.User.GetUserId();
        var result = await _formService.DeleteFormAsync(formId, currentUserId);

        if (result.IsOk)
        {
            return NoContent();
        }

        return result.Error.IntoRespose();
    }
}