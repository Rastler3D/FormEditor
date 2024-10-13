using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FormEditor.Server.Data;
using FormEditor.Server.Models;
using NuGet.Protocol;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DbConnection") ?? throw new InvalidOperationException("Connection string 'DbConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddDefaultIdentity<User>(options =>
    {
        options.User.RequireUniqueEmail = true; ;
        if (builder.Environment.IsProduction())
        {
            options.SignIn.RequireConfirmedAccount = false;
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequiredLength = 6;
        }
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddApiEndpoints();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

var userScope = app.MapGroup("/user");
{
    userScope.MapIdentityApi<User>();
    userScope.MapGet("/",(ClaimsPrincipal user, UserManager<User> userManager) => userManager.GetUserAsync(user));
}

app.MapFallbackToFile("/index.html");

app.Run();
