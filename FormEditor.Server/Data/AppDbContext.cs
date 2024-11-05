using FormEditor.Server.Models;
using FormEditor.Server.Utils;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FormEditor.Server.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<User, IdentityRole<int>, int>(options)
{
    public DbSet<Template> Templates { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Form> Forms { get; set; }
    public DbSet<Answer> Answers { get; set; }

    public DbSet<Tag> Tags { get; set; }
    public DbSet<Topic> Topics { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<AllowList> AllowList { get; set; }
    public DbSet<ApiToken> ApiTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<ApiToken>()
            .HasOne(a => a.User)
            .WithOne(u => u.ApiToken)
            .HasForeignKey<ApiToken>(a => a.UserId);
        builder.Entity<User>().ToTable("Users").Property(p => p.Id).HasColumnName("UserId");
        builder.Entity<User>().HasMany(e => e.Roles)
            .WithMany()
            .UsingEntity<IdentityUserRole<int>>();
        builder.Entity<IdentityUserToken<int>>().ToTable("UserTokens");
        builder.Entity<IdentityUserRole<int>>().ToTable("UserRoles");
        builder.Entity<IdentityUserLogin<int>>().ToTable("UserLogins");
        builder.Entity<IdentityUserClaim<int>>().ToTable("UserClaims");
        builder.Entity<IdentityRoleClaim<int>>().ToTable("RoleClaims");
        builder.Entity<IdentityRole<int>>().ToTable("Roles");
        builder.Entity<Question>()
            .HasIndex(q => new { q.TemplateId, q.Order });

        builder.Entity<Answer>()
            .HasIndex(a => a.StringValue);

        builder.Entity<Answer>()
            .HasIndex(a => a.NumericValue);

        builder.Entity<Answer>()
            .HasIndex(a => a.BooleanValue);
        builder.Entity<Template>()
            .Property(u => u.AccessSetting)
            .HasConversion<string>();
        builder.Entity<Question>()
            .HasOne(q => q.Template)
            .WithMany(t => t.Questions)
            .HasForeignKey(q => q.TemplateId);

        builder.Entity<Form>()
            .HasOne(f => f.Template)
            .WithMany(t => t.Forms)
            .HasForeignKey(f => f.TemplateId);
        builder.Entity<Form>()
            .HasOne(f => f.Submitter)
            .WithMany(t => t.Forms)
            .HasForeignKey(f => f.SubmitterId);


        builder.Entity<Answer>()
            .HasOne(a => a.Form)
            .WithMany(f => f.Answers)
            .HasForeignKey(a => a.FormId);

        builder.Entity<Answer>()
            .HasOne(a => a.Question)
            .WithMany(q => q.Answers)
            .HasForeignKey(a => a.QuestionId);

        builder.Entity<Template>()
            .HasMany<User>()
            .WithMany()
            .UsingEntity<AllowList>();
        builder.Entity<Template>()
            .HasOne<User>(t => t.Creator)
            .WithMany(u => u.Templates)
            .HasForeignKey(t => t.CreatorId)
            .IsRequired();
        builder.Entity<Template>()
            .HasMany<User>()
            .WithMany()
            .UsingEntity<Like>();
        builder.Entity<Comment>()
            .HasOne(c => c.Template)
            .WithMany(t => t.Comments)
            .HasForeignKey(c => c.TemplateId);

        builder.Entity<Comment>()
            .HasOne(c => c.Author)
            .WithMany()
            .HasForeignKey(c => c.AuthorId);

        builder.Entity<ApiToken>().HasIndex(x => x.UserId);
        builder.Entity<ApiToken>().HasIndex(x => x.Token);
        builder.Entity<AllowList>().HasIndex(x => x.TemplateId);
        builder.Entity<AllowList>().HasIndex(x => x.UserId);
        builder.Entity<Comment>().HasIndex(x => x.TemplateId);
        builder.Entity<Comment>().HasIndex(x => x.AuthorId);
        builder.Entity<Like>().HasIndex(x => x.TemplateId);
        builder.Entity<Like>().HasIndex(x => x.UserId);
        builder.Entity<Topic>().HasIndex(x => x.Name);
        builder.Entity<Tag>().HasIndex(x => x.Name);
        builder.Entity<Answer>().HasIndex(x => x.QuestionId);
        builder.Entity<Answer>().HasIndex(x => x.FormId);
        builder.Entity<Form>().HasIndex(x => x.TemplateId);
        builder.Entity<Form>().HasIndex(x => x.SubmitterId);
        builder.Entity<Form>().HasIndex(x => x.FillingDate);
        builder.Entity<Form>().HasIndex(x => x.SubmittedAt);
        builder.Entity<Template>().HasIndex(x => x.CreatedAt);
        builder.Entity<Template>().HasIndex(x => x.CreatorId);
        builder.Entity<Template>().HasIndex(x => x.FilledCount);
        builder.Entity<Template>().HasIndex(x => x.Name);
    }

    protected override void ConfigureConventions(
        Microsoft.EntityFrameworkCore.ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);

        configurationBuilder.Properties<DateTime>()
            .HaveConversion<DateTimeToDateTimeUtc>();
    }
}