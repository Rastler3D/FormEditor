using FormEditor.Server.Models;
using FormEditor.Server.Utils;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Identity;
using NetCoreForce.Client;

namespace FormEditor.Server.Services;
public interface ISalesforceService
{
    Task<Result<Error>> CreateAccountAsync(SalesforceAccountViewModel request, int userId);
    Task<Result<Error>> DisconnectAsync(int userId);
    Task<bool> GetConnectionStatusAsync(int userId);
}

public class SalesforceService : ISalesforceService
{
    private const string TOKEN_ENDPOINT = "https://login.salesforce.com/services/oauth2/token";
    private readonly string _clientId;
    private readonly string _clientSecret;
    private readonly string _username;
    private readonly string _password;
    private readonly UserManager<User> _userManager;

    public SalesforceService(IConfiguration configuration, UserManager<User> userManager)
    {
        _userManager = userManager;
        _clientId = configuration["SALESFORCE_CLIENT_ID"];
        _clientSecret = configuration["SALESFORCE_CLIENT_SECRET"];
        _username = configuration["SALESFORCE_CLIENT_USERNAME"];
        _password = configuration["SALESFORCE_CLIENT_PASSWORD"];
    }

    private async Task<Result<ForceClient, Error>> GetAuthenticatedClientAsync()
    {
        try
        {
            var auth = new AuthenticationClient();
            await auth.UsernamePasswordAsync(_clientId, _clientSecret, _username, _password, TOKEN_ENDPOINT);

            return new ForceClient(
                auth.AccessInfo.InstanceUrl,
                auth.ApiVersion,
                auth.AccessInfo.AccessToken,
                accessInfo: auth.AccessInfo
            );
        }
        catch (Exception ex)
        {
            return Error.InternalError("Failed to authenticate with Salesforce");
        }
    }

    public async Task<Result<Error>> CreateAccountAsync(SalesforceAccountViewModel request, int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.SalesforceContact != null)
        {
            return Error.BadRequest("User already have salesforce account.");
        }

        var getClient = await GetAuthenticatedClientAsync();
        if (getClient.IsErr)
        {
            return getClient.Error;
        }

        var client = getClient.Value;
        try
        {
            var account = new SalesforceAccount
            {
                Name = request.Company,
                Phone = request.Phone
            };

            var accountResult = await client.CreateRecord("Account", account);
            if (!accountResult.Success)
            {
                return Error.InternalError(accountResult.Errors.ToString());
            }

            var contact = new SalesforceContact
            {
                AccountId = accountResult.Id,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone
            };

            var contactResult = await client.CreateRecord("Contact", contact);
            if (!contactResult.Success)
            {
                return Error.InternalError(accountResult.Errors.ToString());
            }

            user.SalesforceContact = contactResult.Id;
            await _userManager.UpdateAsync(user);
        }
        catch (ForceApiException error)
        {
            return Error.InternalError(error.Errors.FirstOrDefault()?.Message);
        }
        
        return Result<Error>.Ok();
    }

    public async Task<Result<Error>> DisconnectAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.SalesforceContact == null)
        {
            return Error.BadRequest("User don't have salesforce account.");
        }

        var getClient = await GetAuthenticatedClientAsync();
        if (getClient.IsErr)
        {
            return getClient.Error;
        }

        var client = getClient.Value;
        var salesforceContact = user.SalesforceContact;
        try
        {
            var contact = await client.GetObjectById<SalesforceContact>("Contact", salesforceContact);
            var salesforceAccount = contact.AccountId;
            await client.DeleteRecord("Contact", salesforceContact);
            await client.DeleteRecord("Account", salesforceAccount);
        }
        catch (ForceApiException error)
        {
            return Error.InternalError(error.Errors.FirstOrDefault()?.Message);
        }
        
        return Result<Error>.Ok();
    }

    public async Task<bool> GetConnectionStatusAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.SalesforceContact == null)
        {
            return false;
        }
        
        return true;
    }
}