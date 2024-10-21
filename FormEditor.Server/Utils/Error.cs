using Microsoft.AspNetCore.Mvc;

namespace FormEditor.Server.Utils;

public abstract class Error
{
    protected Error() { }
    
    public static Error NotFound(string? message) => new NotFound(message);
    public static Error InternalError(string? message) => new InternalError(message);
    public static Error Unauthorized(string? message) => new Unauthorized(message);
    
    public abstract IActionResult IntoRespose();
    
}

public class NotFound(string? message) : Error
{
    public override IActionResult IntoRespose() => new NotFoundObjectResult(message);
}

public class Unauthorized(string? message) : Error
{
    public override IActionResult IntoRespose() => new UnauthorizedObjectResult(message);
}

public class InternalError(string? message) : Error
{
    public override IActionResult IntoRespose() => new BadRequestObjectResult(message);
}