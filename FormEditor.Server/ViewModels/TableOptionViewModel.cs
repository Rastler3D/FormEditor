namespace FormEditor.Server.ViewModels;

public class TableOptionViewModel
{
    public List<string> sort { get; set; } = [];
    public int page { get; set; } = 0;
    public int pageSize { get; set; } = 12;
    public string filter { get; set; } = string.Empty;
}