using Microsoft.EntityFrameworkCore;
using BrainLogger.Models;

namespace BrainLogger.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<LogEntry> Logs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LogEntry>()
            .Property(l => l.Type)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion<string>();

        modelBuilder.Entity<LogEntry>()
            .Property(l => l.Content)
            .IsRequired();
            
        // Indexes for performance (as per spec)
        modelBuilder.Entity<LogEntry>().HasIndex(l => l.UserId);
        modelBuilder.Entity<LogEntry>().HasIndex(l => l.Type);
        modelBuilder.Entity<LogEntry>().HasIndex(l => l.Timestamp);
    }
}
