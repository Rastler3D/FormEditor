using System.Linq.Expressions;
using FormEditor.Server.Models;
using FormEditor.Server.Utils;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Atlassian.Jira;
using AutoMapper;

namespace FormEditor.Server.Services;

public interface IJiraService
{
    Task<Result<Error>> ConnectAccountAsync(string email, int userId, int creatorId);
    Task<Result<Error>> DisconnectAccountAsync(int userId, int removerId);
    Task<bool> GetConnectionStatusAsync(int userId);
    Task<Result<string, Error>> CreateTicket(JiraTicketRequestViewModel request, int reporterId);
    Task<Result<TableData<JiraTicket[]>, Error>> GetUserTickets(int userId, TableOptionViewModel options);
}

public class JiraService : IJiraService
{
    private readonly Jira _jira;
    private readonly string _jiraDomain;
    private readonly string _jiraProjectKey;
    private readonly IMapper _mapper;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<JiraService> _logger;

    public JiraService(IConfiguration configuration, UserManager<User> userManager, IMapper mapper, ILogger<JiraService> logger)
    {
        _mapper = mapper;
        _userManager = userManager;
        _jiraDomain = configuration["JIRA_DOMAIN"];
        _jiraProjectKey = configuration["JIRA_PROJECT_KEY"];
        _logger = logger;
        var jiraUrl = $"https://{_jiraDomain}.atlassian.net";
        var jiraUser = configuration["JIRA_EMAIL"];
        var jiraApiToken = configuration["JIRA_API_KEY"];

        _jira = Jira.CreateRestClient(jiraUrl, jiraUser, jiraApiToken,
            new JiraRestClientSettings { EnableUserPrivacyMode = true });
    }

    public async Task<Result<Error>> ConnectAccountAsync(string email, int userId, int creatorId)
    {
        var creator = await _userManager.FindByIdAsync(userId.ToString());
        if (creator == null)
        {
            return Error.NotFound("User not found");
        }

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (creatorId != userId && !await _userManager.IsInRoleAsync(creator, Roles.Admin))
        {
            return Error.Unauthorized("You have no permission to connect jira integration");
        }

        if (user == null || user.JiraAccount != null)
        {
            return Error.BadRequest("User already have connected jira account.");
        }

        var createUser = await CreateOrGetUser(email);
        if (createUser.IsErr)
        {
            return createUser.Error;
        }

        var jiraUser = createUser.Value;
        user.JiraAccount = jiraUser.AccountId;
        await _userManager.UpdateAsync(user);

        return Result<Error>.Ok();
    }

    public async Task<Result<Error>> DisconnectAccountAsync(int userId, int removerId)
    {
        var remover = await _userManager.FindByIdAsync(userId.ToString());
        if (remover == null)
        {
            return Error.NotFound("User not found");
        }

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (removerId != userId && !await _userManager.IsInRoleAsync(remover, Roles.Admin))
        {
            return Error.Unauthorized("You have no permission to disconnect jira integration");
        }

        if (user == null || user.JiraAccount == null)
        {
            return Error.BadRequest("User don't have connected jira account.");
        }

        try
        {
            await _jira.Users.DeleteUserAsync(user.JiraAccount);
        }
        catch (InvalidOperationException err)
        {
        }

        user.JiraAccount = null;
        await _userManager.UpdateAsync(user);

        return Result<Error>.Ok();
    }

    public async Task<bool> GetConnectionStatusAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.JiraAccount == null)
        {
            return false;
        }

        return true;
    }

    public async Task<Result<string, Error>> CreateTicket(JiraTicketRequestViewModel request, int reporterId)
    {
        var user = await _userManager.FindByIdAsync(reporterId.ToString());
        if (user == null)
        {
            return Error.NotFound("User not found");
        }

        JiraUser reportedBy;
        if (user.JiraAccount == null)
        {
            var createUser = await CreateOrGetUser(user.Email!);
            if (createUser.IsErr)
            {
                return createUser.Error;
            }

            reportedBy = createUser.Value;
            user.JiraAccount = reportedBy.AccountId;
            await _userManager.UpdateAsync(user);
        }
        else
        {
            reportedBy = await _jira.Users.GetUserAsync(user.JiraAccount);
        }

        try
        {
            var issue = _jira.CreateIssue(_jiraProjectKey);
            issue.Type = "Ticket";
            issue.Summary = request.Summary;
            issue.Priority = request.Priority.ToString();
            issue.Description = request.Description;
            issue.Reporter = reportedBy.AccountId;
            issue["Template ID"] = request.TemplateId.ToString();
            issue["Link"] = request.Link;

            await issue.SaveChangesAsync();

            return GetJiraTicketUrl(issue.Key.Value);
        }
        catch (InvalidOperationException err)
        {
            return Error.BadRequest($"Failed to create ticket. {err.Message}");
        }
    }

    public string GetJiraTicketUrl(string issueKey)
    {
        return $"https://{_jiraDomain}.atlassian.net/browse/{issueKey}";
    }

    public async Task<Result<TableData<JiraTicket[]>, Error>> GetUserTickets(int userId,
        TableOptionViewModel tableOptions)
    {
        var options = _mapper.Map<TableOption>(tableOptions);
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return Error.NotFound("User not found");
        }

        if (user.JiraAccount == null)
        {
            return Error.NotFound("User don't have connected jira account.");
        }

        var accoundId = user.JiraAccount!;
        try
        {
            var data = await ApplyTableOptions(
                _jira.Issues.Queryable.Where(issue => issue.Reporter == accoundId),
                options);
            foreach (var issue in data.Data)
            {
                _logger.LogError("Issue {issue}, {summary}, {status}, {created}, {description}, {template}, {link}, {priority},", issue.Key.Value, issue.Summary, issue.Status, issue.Created, issue.Description, issue["Template ID"], issue["Link"], issue.Priority);
            }

            return data.MapData(issues => issues.Select(issue => new JiraTicket
            {
                Key = issue.Key.Value,
                Summary = issue.Summary,
                Status = issue.Status.Name,
                Priority = Enum.Parse<TicketPriority>(issue.Priority.Name),
                CreatedAt = issue.Created.GetValueOrDefault(),
                Description = issue.Description,
                Link = issue["Link"].Value,
                ReportedBy = issue.ReporterUser?.Email,
                TemplateId = int.Parse(issue["Template ID"].Value),
                Url = GetJiraTicketUrl(issue.Key.Value),
            }).ToArray());
        }
        catch (InvalidOperationException err)
        {
            return Error.BadRequest($"Failed to get tickets. {err.Message}");
        }
    }

    private async Task<TableData<List<Issue>>> ApplyTableOptions(IQueryable<Issue> users, TableOption options)
    {
        if (!String.IsNullOrWhiteSpace(options.Filter))
        {
            users = users.Where(f =>
                f.Description == options.Filter ||
                f.Summary == options.Filter
            );
        }
        var totalRows = await Task.Run(users.Count);

        foreach (var sortOption in options.Sort)
        {
            Expression<Func<Issue, object>> selector = sortOption.Id switch
            {
                "templateId" => x => x["Template ID"],
                "status" => x => x.Status,
                "priority" => x => x.Priority,
                "createdAt" => x => x.Created,
                _ => x => x.Key
            };

            if (sortOption.Desc)
            {
                users = users.OrderByDescending(selector);
            }
            else
            {
                users = users.OrderBy(selector);
            }
        }

        users = users.Skip(options.Pagination.PageSize * options.Pagination.PageIndex)
            .Take(options.Pagination.PageSize);

        return new()
        {
            Data = (await Task.Run(users.ToList)) ?? new List<Issue>(),
            TotalRows = totalRows
        };
    }

    private async Task<Result<JiraUser, Error>> CreateOrGetUser(string email)
    {
        try
        {
            var existingUser = (await _jira.Users.SearchUsersAsync(email)).FirstOrDefault();
            if (existingUser != null)
            {
                return existingUser;
            }

            var newUser = await _jira.Users.CreateUserAsync(new JiraUserCreation
            {
                Email = email,
                Notification = true,
                Products = ["jira-software"]
            });

            return newUser;
        }
        catch (InvalidOperationException err)
        {
            return Error.BadRequest($"Failed to get or create user. {err.Message}");
        }
    }
}