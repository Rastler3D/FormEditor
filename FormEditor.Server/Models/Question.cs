namespace FormEditor.Server.Models;

public class Question
{
    public int Id { get; set; }
    public QuestionType Type { get; set; }
    public int TemplateId { get; set; }
    public Template Template { get; set; }
    public int Order { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public HashSet<string> Options { get; set; }
    public bool DisplayInTable { get; set; }
    public List<Answer> Answers { get; set; }
}

public enum QuestionType
{
    SingleLine,
    MultiLine,
    Integer,
    Checkbox,
    Select
}