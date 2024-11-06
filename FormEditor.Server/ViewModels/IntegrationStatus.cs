namespace FormEditor.Server.ViewModels;

public class IntegrationStatus<T>
{
    public bool IsConnected { get; set; }
    public T? Info { get; set; }

    public static IntegrationStatus<T> NotConnected()
    {
        return new IntegrationStatus<T>
        {
            IsConnected = false,
        };
    }
    
    public static IntegrationStatus<T> Connected(T value)
    {
        return new IntegrationStatus<T>
        {
            IsConnected = true,
            Info = value
        };
    }
}