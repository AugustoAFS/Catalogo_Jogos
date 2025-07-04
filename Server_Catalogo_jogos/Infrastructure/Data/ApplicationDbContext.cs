using Microsoft.EntityFrameworkCore;
using Core.Entities;

namespace Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Game> Games { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Cart> CartItems { get; set; }
        public DbSet<Rating> Ratings { get; set; }
        public DbSet<Role> Roles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("Roles");
                entity.HasKey(e => e.Id_Role);
            });

            modelBuilder.Entity<Game>(entity =>
            {
                entity.ToTable("Games");
                entity.HasKey(e => e.Id_Game);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(e => e.Id_User);
            });

            modelBuilder.Entity<Cart>(entity =>
            {
                entity.ToTable("CartItems");
                entity.HasKey(e => e.Id_Cart);
                
                // Configurar relação com Game
                entity.HasOne(c => c.Game)
                    .WithMany()
                    .HasForeignKey(c => c.Id_Game)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Configurar relação com User
                entity.HasOne(c => c.User)
                    .WithMany()
                    .HasForeignKey(c => c.Id_User)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Rating>(entity =>
            {
                entity.ToTable("Ratings");
                entity.HasKey(e => e.Id_Rating);
            });
        }
    }
} 