using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemaBooking.DAL.Configurations;

public class ShowtimeConfiguration : IEntityTypeConfiguration<Showtime>
{
    public void Configure(EntityTypeBuilder<Showtime> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Price).HasColumnType("decimal(18,2)");
        builder.HasOne(s => s.Movie)
               .WithMany(m => m.Showtimes)
               .HasForeignKey(s => s.MovieId)
               .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(s => s.Hall)
               .WithMany(h => h.Showtimes)
               .HasForeignKey(s => s.HallId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
