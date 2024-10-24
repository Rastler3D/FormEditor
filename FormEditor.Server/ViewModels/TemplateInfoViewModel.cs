namespace FormEditor.Server.ViewModels;

public class TemplateInfoViewModel
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Topic { get; set; }
    public string? Image { get; set; }
    public int CreatorId { get; set; }
    public string CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public HashSet<string> Tags { get; set; }
    public AccessSetting AccessSetting { get; set; }
    public List<int>? AllowList { get; set; }
    public int FilledCount { get; set; }
    public int Likes { get; set; }
}