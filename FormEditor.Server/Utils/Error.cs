using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace FormEditor.Server.Utils;

public abstract class Error
{
    public abstract string ErrorType { get; }
    public abstract string Message { get; }
    
    protected Error() { }
    
    public static Error NotFound(string? message) => new NotFound(message);
    public static Error InternalError(string? message) => new InternalError(message);
    public static Error Unauthorized(string? message) => new Unauthorized(message);
    
    public abstract ProblemHttpResult IntoRespose();
    
}

public class NotFound(string? message) : Error
{
    public override string ErrorType => "Not Found";
    public override string Message => message ?? "";
    public override ProblemHttpResult IntoRespose() => TypedResults.Problem(message, statusCode: StatusCodes.Status404NotFound);
}

public class Unauthorized(string? message) : Error
{
    public override string ErrorType => "Unauthorized";
    public override string Message => message ?? "";
    public override ProblemHttpResult IntoRespose() => TypedResults.Problem(message, statusCode: StatusCodes.Status401Unauthorized);
    
    public override string ToString()
    {
        return $"Error: Unaut. Message: {message}";
    }
}

public class InternalError(string? message) : Error
{
    public override string ErrorType => "InternalError";
    public override string Message => message ?? "";
    public override ProblemHttpResult IntoRespose() => TypedResults.Problem(message, statusCode: StatusCodes.Status500InternalServerError);
}