namespace FormEditor.Server.ViewModels;

public class UserViewModel
{
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string? Avatar { get; set; }
        public RoleViewModel Role { get; set; }
        public StatusViewModel Status { get; set; }
}

public enum RoleViewModel
{
        Admin,
        User
}

public enum StatusViewModel
{
        Active,
        Blocked
}