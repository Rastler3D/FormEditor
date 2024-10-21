namespace FormEditor.Server.ViewModels;

public class CommentViewModel
{
    public int Id { get; set; }
    public string Text { get; set; }
    public string Author { get; set; }
    public DateTime Date { get; set; }
    public int TemplateId { get; set; }
}