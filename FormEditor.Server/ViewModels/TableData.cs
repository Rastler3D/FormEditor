namespace FormEditor.Server.ViewModels;

public class TableData<T>
{
    public T Data { get; set; }
    public int TotalRows { get; set; }

    public TableData<TT> MapData<TT>(Func<T, TT> map)
    {
        return new TableData<TT>
        {
            Data = map(Data),
            TotalRows = TotalRows
        };
    }
}