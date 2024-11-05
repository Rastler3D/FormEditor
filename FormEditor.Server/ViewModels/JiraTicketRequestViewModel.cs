using Atlassian.Jira;
using Newtonsoft.Json;

namespace FormEditor.Server.ViewModels;

public class JiraTicketRequestViewModel
{
    public string Summary { get; set; }
    public TicketPriority Priority { get; set; }
    public int TemplateId { get; set; }
    public string Link { get; set; }
    public string Description { get; set; }
}

public class JiraTicket
{
    public string Key { get; set; }
    public string Summary { get; set; }
    public string Status { get; set; }
    public TicketPriority Priority { get; set; }
    public int? TemplateId { get; set; }
    public string Link { get; set; }
    public string Description { get; set; }
    public string ReportedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Url { get; set; }
}

public enum TicketPriority
{
    High,
    Average,
    Low
}

    public class JiraUserCreation: JiraUserCreationInfo
    {
        [JsonProperty("products")] 
        public string[] Products { get; set; } = [];
    }