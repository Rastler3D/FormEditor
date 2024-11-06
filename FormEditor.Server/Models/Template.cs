using FormEditor.Server.Models;

public class Template
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string? Image { get; set; }
    public int CreatorId { get; set; }
    public DateTime CreatedAt { get; set; }
    public User Creator{ get; set; }
    public Topic Topic { get; set; }
    public HashSet<Tag> Tags { get; set; }
    public AccessSetting AccessSetting { get; set; }
    public List<AllowList>? AllowList { get; set; }
    public List<Like> Likes { get; set; }
    public List<Question> Questions { get; set; }
    public List<Form> Forms { get; set; }
    public int FilledCount { get; set; }
    
    public List<Comment> Comments { get; set; }
}
public enum AccessSetting
{
    All,
    Specified
}