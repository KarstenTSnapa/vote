using Microsoft.EntityFrameworkCore;
using VoteApi.Data;
using VoteApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Use SQLite file in the backend folder (messages.db)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=messages.db"));

// Restrict CORS to your GitHub Pages site and the specific ngrok tunnel URL.
// Note: CORS uses origin (scheme + host + port) and does not include path segments.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecific", p => p
        .WithOrigins(
            "https://karstentsnapa.github.io", // GitHub Pages origin (no path)
            "https://notifiable-phylar-elvera.ngrok-free.dev" // replace if your ngrok URL changes
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
    );
});

var app = builder.Build();
app.UseCors("AllowSpecific");

// Ensure DB created on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.MapGet("/messages", async (AppDbContext db, HttpContext ctx) =>
{
    // TEMP LOGGING: dump incoming request headers to the console to help debug ngrok / CORS
    Console.WriteLine("--- /messages request received ---");
    foreach (var h in ctx.Request.Headers)
    {
        Console.WriteLine($"{h.Key}: {h.Value}");
    }
    Console.WriteLine("----------------------------------");

    return await db.Messages.OrderByDescending(m => m.Votes).ThenByDescending(m => m.CreatedAt).ToListAsync();
});
app.MapPost("/messages", async (MessageDto dto, AppDbContext db) =>
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

app.MapPost("/messages/{id:int}/upvote", async (int id, AppDbContext db) =>
{
    var m = await db.Messages.FindAsync(id);
    if (m == null) return Results.NotFound();
    m.Votes++;
    await db.SaveChangesAsync();
    return Results.Ok(m);
});

// ADMIN: delete all messages - use with caution. You can call this locally or via ngrok.
app.MapDelete("/messages", async (AppDbContext db) =>
{
    var all = await db.Messages.ToListAsync();
    if (all.Count == 0) return Results.Ok(new { deleted = 0 });
    db.Messages.RemoveRange(all);
    var deleted = await db.SaveChangesAsync();
    return Results.Ok(new { deleted = deleted });
});

app.Run();

// DTO and small record types inside the same file for simplicity
public record MessageDto(string Text);
