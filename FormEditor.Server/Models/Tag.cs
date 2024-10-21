namespace FormEditor.Server.Models;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; }
    public List<Template> Templates { get; set; }
}