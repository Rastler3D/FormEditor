using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using FormEditor.Server.Data;
using FormEditor.Server.Models;
using FormEditor.Server.Utils;
using Microsoft.EntityFrameworkCore;

namespace FormEditor.Server.Services;

public interface IApiTokenService
{
    Task<string> GenerateTokenForUser(int userId);
    Task<bool> ValidateToken(string token);
    Task<int?> GetUserIdFromToken(string token);
    Task<Result<string, Error>> GetUserToken(int userId);
}


public class ApiTokenService: IApiTokenService
{
    private readonly AppDbContext _context;

    public ApiTokenService(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<Result<string, Error>> GetUserToken(int userId)
    {
        
        var apiToken = await _context.ApiTokens.Where(x => x.UserId == userId).FirstOrDefaultAsync();
        if (apiToken == null)
        {
            return Error.NotFound("Token not found");
        }

        return apiToken.Token;
    }

    public async Task<string> GenerateTokenForUser(int userId)
    {
        var token = GenerateSecureToken();
        var apiToken = new ApiToken
        {
            Token = token,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(30) // Token expires after 30 days
        };
        await _context.ApiTokens.Where(x => x.UserId == userId).ExecuteDeleteAsync();
        await _context.ApiTokens.AddAsync(apiToken);
        await _context.SaveChangesAsync();

        return token;
    }

    public async Task<bool> ValidateToken(string token)
    {
        var apiToken = await _context.ApiTokens
            .FirstOrDefaultAsync(t => t.Token == token && (!t.ExpiresAt.HasValue || t.ExpiresAt > DateTime.UtcNow));

        return apiToken != null;
    }

    public async Task<int?> GetUserIdFromToken(string token)
    {
        var apiToken = await _context.ApiTokens
            .FirstOrDefaultAsync(t => t.Token == token && (!t.ExpiresAt.HasValue || t.ExpiresAt > DateTime.UtcNow));

        return apiToken?.UserId;
    }

    private string GenerateSecureToken()
    {
        var randomNumber = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}