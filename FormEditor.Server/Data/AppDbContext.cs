
using FormEditor.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FormEditor.Server.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<User, IdentityRole<int>, int>(options)
{
    public DbSet<Template> Templates { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Form> Forms { get; set; }
    public DbSet<Answer> Answers { get; set; }
    
    public DbSet<Tag> Tags { get; set; }
    public DbSet<Topic> Topics { get; set; }
    public DbSet<Like> Likes { get; set; }
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        builder.Entity<User>().ToTable("Users").Property(p => p.Id).HasColumnName("UserId");
        builder.Entity<User>().HasMany(e => e.Roles)
            .WithMany()
            .UsingEntity<IdentityUserRole<int>>();
        builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
        builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
        builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
        builder.Entity<IdentityRole>().ToTable("Roles");
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
            .HasOne<User>(t=> t.Creator)
            .WithMany(u => u.Templates)
            .HasForeignKey(t => t.CreatorId)
            .IsRequired();
        builder.Entity<Template>()
            .HasMany<User>()
            .WithMany()
            .UsingEntity<Like>();
    }
}
