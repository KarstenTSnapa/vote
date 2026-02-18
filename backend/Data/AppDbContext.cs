using Microsoft.EntityFrameworkCore;
using VoteApi.Models;

namespace VoteApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
            public DbSet<Message> Messages { get; set; } = null!;
    }
}
