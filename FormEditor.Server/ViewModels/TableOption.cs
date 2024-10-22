namespace FormEditor.Server.ViewModels;

public class TableOption
{
    public List<SortOption> Sort { get; set; }
    public PaginationOption Pagination { get; set; }
    public string Filter { get; set; }

    public TableOption(int page, int pageSize, string filter, List<string> sort)
    {
        Sort = sort.Select(s => new SortOption(s)).ToList();
        Filter = filter;
        Pagination = new PaginationOption(page, pageSize);
    }
    
}

public class SortOption
{
    public string Id { get; set; }
    public bool Desc { get; set; }

    public SortOption(string sort)
    {
        Desc = sort.StartsWith('-');
        Id = sort.TrimStart('-');
    }
    
}

public class PaginationOption
{
    public int PageIndex { get; set; }
    public int PageSize { get; set; }

    public PaginationOption(int page, int pageSize)
    {
        PageIndex = page - 1;
        PageSize = pageSize;
    }
}