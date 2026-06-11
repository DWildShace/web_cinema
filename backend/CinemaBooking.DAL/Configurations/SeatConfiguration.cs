using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemaBooking.DAL.Configurations;

public class SeatConfiguration : IEntityTypeConfiguration<Seat>
{
    public void Configure(EntityTypeBuilder<Seat> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Type).HasConversion<string>();
        builder.HasOne(s => s.Hall)
               .WithMany(h => h.Seats)
               .HasForeignKey(s => s.HallId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
