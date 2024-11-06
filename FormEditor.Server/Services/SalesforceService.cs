using FormEditor.Server.Models;
using FormEditor.Server.Utils;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Identity;
using NetCoreForce.Client;

namespace FormEditor.Server.Services;
public interface ISalesforceService
{
    Task<Result<Error>> ConnectAccountAsync(SalesforceAccountViewModel request, int userId, int creatorId);
    Task<Result<Error>> DisconnectAccountAsync(int userId, int removerId);
    Task<IntegrationStatus<SalesforceAccountViewModel>> GetConnectionStatusAsync(int userId);
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
        catch (ForceAuthException error)
        {
            return Error.InternalError(error.Message);
            
        }
    }

    public async Task<Result<Error>> ConnectAccountAsync(SalesforceAccountViewModel request, int userId, int creatorId)
    {
        var creator = await _userManager.FindByIdAsync(userId.ToString());
        if (creator == null)
        {
            return Error.NotFound("User not found");
        }
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (creatorId != userId && !await _userManager.IsInRoleAsync(creator, Roles.Admin))
        {
            return Error.Unauthorized("You have no permission to connect salesforce integration");
        }
        
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

    public async Task<Result<Error>> DisconnectAccountAsync(int userId, int removerId)
    {
        var remover = await _userManager.FindByIdAsync(userId.ToString());
        if (remover == null)
        {
            return Error.NotFound("User not found");
        }
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (removerId != userId && !await _userManager.IsInRoleAsync(remover, Roles.Admin))
        {
            return Error.Unauthorized("You have no permission to disconnect salesforce integration");
        }
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
            
            user.SalesforceContact = null;
            await _userManager.UpdateAsync(user);
        }
        catch (ForceApiException error)
        {
            return Error.InternalError(error.Errors.FirstOrDefault()?.Message);
        }
        
        return Result<Error>.Ok();
    }
    
    public async Task<IntegrationStatus<SalesforceAccountViewModel>> GetConnectionStatusAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        var getClient = await GetAuthenticatedClientAsync();
        if (user == null || user.SalesforceContact == null || getClient.IsErr)
        {
            return IntegrationStatus<SalesforceAccountViewModel>.NotConnected();
        }
        var salesforce = getClient.Value;
        
        var contact = await salesforce.GetObjectById<SalesforceContact>("Contact", user.SalesforceContact);
        var account = await salesforce.GetObjectById<SalesforceAccount>("Account", contact.AccountId);
        
        var salesforceAccount = new SalesforceAccountViewModel
        {
            Company = account.Name,
            Email = contact.Email,
            FirstName = contact.FirstName,
            LastName = contact.LastName,
            Phone = contact.Phone,
        };
        
        return IntegrationStatus<SalesforceAccountViewModel>.Connected(salesforceAccount);
    }
}