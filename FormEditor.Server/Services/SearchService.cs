using FormEditor.Server.ViewModels;
using Meilisearch;

namespace FormEditor.Server.Services;

using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

// Services/MeiliSearchService.cs
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

public interface ISearchService
{
    Task Initialize();
    Task UpsertTemplateAsync(TemplateViewModel template);
    Task DeleteTemplateAsync(int templateId);
}

public class MeiliSearchService : ISearchService
{
    private readonly IConfiguration _configuration;
    private MeilisearchClient _client;

    public MeiliSearchService(IConfiguration configuration)
    {
        _configuration = configuration;
        var host = _configuration["VITE_MEILISEARCH_URL"]??"https://meilisearch-rastler3d.up.railway.app";
        var masterKey = _configuration["MEILISEARCH_MASTER_KEY"]??"gdvwfp4jb2bnr9wy79ocme33e8yafewl";
        _client = new MeilisearchClient(host, masterKey);
    }


    public async Task Initialize()
    {
        await _client.CreateIndexAsync("templates", "id");
        await _client.Index("templates").UpdateFilterableAttributesAsync(["tags", "topic"]);
        await _client.Index("templates").UpdateSortableAttributesAsync(["name", "filledCount", "createdAt"]);

        await _client.CreateKeyAsync(new Key
        {
            Description = "Search key for front end application",
            Actions = [KeyAction.Search],
            Indexes = ["*"],
            ExpiresAt = null,
            Uid = _configuration["MEILISEARCH_API_KEY_UID"],
        });
    }
    

    public async Task UpsertTemplateAsync(TemplateViewModel template)
    {
        
        await _client.Index("templates").AddDocumentsAsync([template]);
    }

    public async Task DeleteTemplateAsync(int templateId)
    {
        await _client.Index("templates").DeleteOneDocumentAsync(templateId);
    }
}