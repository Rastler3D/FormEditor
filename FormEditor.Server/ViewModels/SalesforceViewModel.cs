namespace FormEditor.Server.ViewModels;

public class SalesforceAccountViewModel
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Company { get; set; }
    public string Phone { get; set; }
}

public class SalesforceContact
{
    public string AccountId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
}

public class SalesforceAccount
{
    public string Name { get; set; }
    public string Phone { get; set; }
}

public class SalesforceConnectionStatus
{
    public bool Connected { get; set; }
}