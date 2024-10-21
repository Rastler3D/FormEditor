using FormEditor.Server.Models;

namespace FormEditor.Server.ViewModels;

public class FilledFormViewModel
{ 
    public Dictionary<int, AnswerViewModel> Answers { get; set; }
    public DateTime FillingDate { get; set; }
    public int TemplateId { get; set; }
    public bool SendEmail { get; set; }
}