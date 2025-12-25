using System.Text.Json.Serialization;

namespace BrainLogger.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EntryType
{
    Task,
    Idea,
    Note,
    Wait
}
