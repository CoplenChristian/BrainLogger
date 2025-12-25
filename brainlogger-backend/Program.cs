using BrainLogger.Data;
using BrainLogger.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                       ?? "Host=localhost;Database=brainlogger;Username=brainlogger;Password=brainlogger";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// API Endpoints

// POST /api/log
app.MapPost("/api/log", async (LogEntry entry, AppDbContext db) =>
{
    // Basic validation
    if (string.IsNullOrWhiteSpace(entry.Content)) return Results.BadRequest("Content is required");
    if (entry.UserId <= 0) return Results.BadRequest("UserId is required");
    
    // Set server-side defaults
    entry.Timestamp = DateTime.UtcNow;
    if (entry.Id != 0) entry.Id = 0; // Force create

    db.Logs.Add(entry);
    await db.SaveChangesAsync();
    return Results.Created($"/api/log/{entry.Id}", entry);
})
.WithOpenApi();

// GET /api/tasks
app.MapGet("/api/tasks", async (AppDbContext db) =>
{
    var tasks = await db.Logs
        .Where(l => l.Type == EntryType.Task && l.CompletedAt == null)
        .OrderByDescending(l => l.Timestamp)
        .ToListAsync();
    return tasks;
})
.WithOpenApi();

// POST /api/flush (Stub)
app.MapPost("/api/flush", () =>
{
    return Results.Ok(new { message = "Flush not implemented yet" });
})
.WithOpenApi();

app.Run();
