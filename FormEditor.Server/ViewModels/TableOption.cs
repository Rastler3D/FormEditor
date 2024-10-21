namespace FormEditor.Server.ViewModels;

public class TableOption
{
    public List<SortOption> Sort { get; set; }
    public PaginationOption Pagination { get; set; }
    public string Filter { get; set; }
    
}

public class SortOption
{
    public string Id { get; set; }
    public bool Desc { get; set; }
}

public class PaginationOption
{
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
}