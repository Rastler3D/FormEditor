using FormEditor.Server.Data;
using FormEditor.Server.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using FormEditor.Server.Services;

namespace FormEditor.Server.Hubs;

public class CommentHub : Hub
{
    private readonly ITemplateService _templateService;

    public CommentHub(ITemplateService templateService)
    {
        _templateService = templateService;
    }

    public async Task JoinFormGroup(int templateId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, templateId.ToString());
        var comments = await _templateService.GetComments(templateId);
        await Clients.Caller.SendAsync("InitialComments", comments);
    }

    public async Task SendComment(int templateId, string commentText)
    {
        var userId = Context.User.GetUserId();
        var comment = await _templateService.AddComment(templateId, userId, commentText);
        if (comment.IsErr)
        {
            await Clients.Caller.SendAsync("Error", comment.Error);
        }
        else
        {
            await Clients.Group(templateId.ToString()).SendAsync("ReceiveComment", comment.Value);
        }
    }
}