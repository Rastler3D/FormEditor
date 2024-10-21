using FormEditor.Server.Models;

namespace FormEditor.Server.ViewModels;

public class FormViewModel
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public string TemplateName { get; set; }
    public int SubmitterId { get; set; }
    public string SubmittedBy { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime FillingDate { get; set; }
    public Dictionary<int, AnswerViewModel> Answers { get; set; }
}