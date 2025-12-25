namespace BrainLogger.Models;

public class LogEntry
{
    public int Id { get; set; }
    public required int UserId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public EntryType Type { get; set; }
    public required string Content { get; set; }
    public DateTime? CompletedAt { get; set; }
}
