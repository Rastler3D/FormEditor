namespace FormEditor.Server.Models;

public class Comment
{
    public int Id { get; set; }
    public string Text { get; set; }
    public int AuthorId { get; set; }
    public User Author { get; set; }
    public DateTime Date { get; set; }
    public int TemplateId { get; set; }
    public Template Template { get; set; }
}