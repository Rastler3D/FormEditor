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
    //private readonly IJiraService _jiraService;
    // private readonly IOdooService _odooService;

    public IntegrationsController(
        ISalesforceService salesforceService
        //IJiraService jiraService,
        //IOdooService odooService
    )
    {
        _salesforceService = salesforceService;
        //_jiraService = jiraService;
        //_odooService = odooService;
    }

    [HttpPost("salesforce/account/{userId:int}")]
    public async Task<Results<NoContent, ProblemHttpResult>> CreateSalesforceAccount(
        [FromBody] SalesforceAccountViewModel request, [FromRoute] int userId)
    {
        var currentUserId = User.GetUserId();
        var result = await _salesforceService.CreateAccountAsync(request, userId, currentUserId);
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
        var result = await _salesforceService.DisconnectAsync(userId, currentUserId);
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
}