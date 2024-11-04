using FormEditor.Server.Models;
using FormEditor.Server.Services;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace FormEditor.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class IntegrationsController : ControllerBase
{
    private readonly ISalesforceService _salesforceService;
    private readonly IJiraService _jiraService;
    // private readonly IOdooService _odooService;

    public IntegrationsController(
        ISalesforceService salesforceService,
        IJiraService jiraService
        //IOdooService odooService
    )
    {
        _salesforceService = salesforceService;
        _jiraService = jiraService;
        //_odooService = odooService;
    }

    [HttpPost("salesforce/account/{userId:int}")]
    public async Task<Results<NoContent, ProblemHttpResult>> ConnectSalesforce(
        [FromBody] SalesforceAccountViewModel request, [FromRoute] int userId)
    {
        var currentUserId = User.GetUserId();
        var result = await _salesforceService.ConnectAccountAsync(request, userId, currentUserId);
        if (result.IsOk)
        {
            return TypedResults.NoContent();
        }

        return result.Error.IntoRespose();
    }

    [HttpDelete("salesforce/account/{userId:int}")]
    public async Task<Results<NoContent, ProblemHttpResult>> DisconnectSalesforce([FromRoute] int userId)
    {
        var currentUserId = User.GetUserId();
        var result = await _salesforceService.DisconnectAccountAsync(userId, currentUserId);
        if (result.IsOk)
        {
            return TypedResults.NoContent();
        }

        return result.Error.IntoRespose();
    }

    [HttpGet("salesforce/account/{userId:int}/status")]
    public async Task<Ok<bool>> GetSalesforceStatus([FromRoute] int userId)
    {
        var result = await _salesforceService.GetConnectionStatusAsync(userId);
        return TypedResults.Ok(result);
    }

    [HttpPost("jira/account/{userId:int}")]
    public async Task<Results<NoContent, ProblemHttpResult>> ConnectJira(
        [FromQuery] string email, [FromRoute] int userId)
    {
        var currentUserId = User.GetUserId();
        var result = await _jiraService.ConnectAccountAsync(email, userId, currentUserId);
        if (result.IsOk)
        {
            return TypedResults.NoContent();
        }

        return result.Error.IntoRespose();
    }

    [HttpDelete("jira/account/{userId:int}")]
    public async Task<Results<NoContent, ProblemHttpResult>> DisconnectJira([FromRoute] int userId)
    {
        var currentUserId = User.GetUserId();
        var result = await _jiraService.DisconnectAccountAsync(userId, currentUserId);
        if (result.IsOk)
        {
            return TypedResults.NoContent();
        }

        return result.Error.IntoRespose();
    }

    [HttpGet("jira/account/{userId:int}/status")]
    public async Task<Ok<bool>> GetJiraStatus([FromRoute] int userId)
    {
        var result = await _jiraService.GetConnectionStatusAsync(userId);
        return TypedResults.Ok(result);
    }

    [HttpPost("jira/ticket")]
    public async Task<Results<Ok<string>, ProblemHttpResult>> CreateTicket([FromBody] JiraTicketRequestViewModel ticket)
    {
        var currentUserId = User.GetUserId();
        var result = await _jiraService.CreateTicket(ticket, currentUserId);
        if (result.IsOk)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }

    [HttpGet("jira/ticket/{userId:int}")]
    public async Task<Results<Ok<TableData<JiraTicket[]>>, ProblemHttpResult>> GetTickets([FromRoute] int userId,
        [FromQuery] TableOptionViewModel options)
    {
        var result = await _jiraService.GetUserTickets(userId, options);
        if (result.IsOk)
        {
            return TypedResults.Ok(result.Value);
        }

        return result.Error.IntoRespose();
    }
}