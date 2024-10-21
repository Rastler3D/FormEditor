using FormEditor.Server.Models;

public class QuestionViewModel
{
    public int? Id { get; set; }
    public QuestionType Type { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public List<string> Options { get; set; }
    public bool DisplayInTable { get; set; }
}