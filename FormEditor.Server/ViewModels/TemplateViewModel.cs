namespace FormEditor.Server.ViewModels;

public class TemplateViewModel
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Image { get; set; }
    public int CreatorId { get; set; }
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Topic { get; set; }
    public HashSet<string> Tags { get; set; }
    public AccessSetting AccessSetting { get; set; }
    public List<int> AllowList { get; set; }
    public int Likes { get; set; }
    public List<QuestionViewModel> Questions { get; set; }
    public int FilledCount { get; set; }
}