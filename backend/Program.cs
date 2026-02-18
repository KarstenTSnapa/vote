using Microsoft.EntityFrameworkCore;
using VoteApi.Data;
using VoteApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Use SQLite file in the backend folder (messages.db)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=messages.db"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowAll");

// Ensure DB created on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

napp.MapGet("/messages", async (AppDbContext db) =>
{
    return await db.Messages.OrderByDescending(m => m.Votes).ThenByDescending(m => m.CreatedAt).ToListAsync();
});

napp.MapPost("/messages", async (MessageDto dto, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dto.Text))
    {
        return Results.BadRequest(new { error = "Text is required" });
    }

    var msg = new Message { Text = dto.Text.Trim(), Votes = 0, CreatedAt = DateTime.UtcNow };
    db.Messages.Add(msg);
    await db.SaveChangesAsync();
    return Results.Created($"/messages/{msg.Id}", msg);
});

napp.MapPost("/messages/{id:int}/upvote", async (int id, AppDbContext db) =>
{
    var m = await db.Messages.FindAsync(id);
    if (m == null) return Results.NotFound();
    m.Votes++;
    await db.SaveChangesAsync();
    return Results.Ok(m);
});

napp.Run();

n// DTO and small record types inside the same file for simplicity
public record MessageDto(string Text);
