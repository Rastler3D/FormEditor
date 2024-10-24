namespace FormEditor.Server.Models;

public class Form
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public Template Template { get; set; }
    public int SubmitterId { get; set; }
    public User Submitter { get; set; }
    public DateTimeOffset FillingDate { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public List<Answer> Answers { get; set; }
}