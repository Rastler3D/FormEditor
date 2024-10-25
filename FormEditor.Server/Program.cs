using System.Text.Json;
using System.Text.Json.Serialization;
using EntityFramework.Exceptions.PostgreSQL;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FormEditor.Server.Data;
using FormEditor.Server.Hubs;
using FormEditor.Server.Mapping;
using FormEditor.Server.Models;
using FormEditor.Server.Repositories;
using FormEditor.Server.Services;
using FormEditor.Server.Utils;
using FormEditor.Server.ViewModels;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity.UI.Services;


var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

if (builder.Environment.IsProduction()){
    var port = Environment.GetEnvironmentVariable("PORT") ?? "8081";
    builder.WebHost.UseUrls($"http://*:{port}");
}

builder.Services.AddRouting(options => options.LowercaseUrls = true);
builder.Services.AddSignalR();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
            "Host=autorack.proxy.rlwy.net;Port=30121;Username=postgres;Password=kibFlVvxfVHuyROnryjSZYQEOtlJUEgC;Database=railway;SSL Mode=Prefer;")
        .UseExceptionProcessor());
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

builder.Services
    .AddAuthentication(AuthenticationHandler.Scheme)
    .AddScheme<AuthenticationSchemeOptions, AuthenticationHandler>(AuthenticationHandler.Scheme, null)
    .AddBearerToken(IdentityConstants.BearerScheme, options =>
    {
        options.Events.OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

            // If the request is for our hub...
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/api/hub")))
            {
                // Read the token out of the query string
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        };
    });
// .AddGoogle(options =>
// {
//     options.ClientId = builder.Configuration["Google:ClientId"];
//     options.ClientSecret = builder.Configuration["Google:ClientSecret"];
//     options.Scope.Add("profile");
//     options.SignInScheme = IdentityConstants.ExternalScheme;
// })
// .AddGitHub();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddIdentityCore<User>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.SignIn.RequireConfirmedAccount = true;
        if (builder.Environment.IsProduction())
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;
        }
        else
        {
            options.Password.RequireDigit = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 1;
        }
    })
    .AddRoles<IdentityRole<int>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddApiEndpoints();
builder.Services.AddAuthorization();
builder.Services.AddAutoMapper(typeof(MappingProfile));
builder.Services.AddTransient<IEmailSender, EmailSender>();
builder.Services.AddScoped<IFormRepository, FormRepository>();
builder.Services.AddScoped<ITemplateRepository, TemplateRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ISearchService, MeiliSearchService>();
builder.Services.AddScoped<IEmailSenderService, EmailSenderService>();
builder.Services.AddScoped<IFormService, FormService>();
builder.Services.AddScoped<ITemplateService, TemplateService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    await DataSeed.SeedAsync(scope.ServiceProvider);
}

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();
app.MapHub<CommentHub>("/api/hub/comment");

app.MapFallbackToFile("/index.html");

app.Run();