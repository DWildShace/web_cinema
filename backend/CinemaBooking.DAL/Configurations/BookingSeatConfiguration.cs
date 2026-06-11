using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemaBooking.DAL.Configurations;

public class BookingSeatConfiguration : IEntityTypeConfiguration<BookingSeat>
{
    public void Configure(EntityTypeBuilder<BookingSeat> builder)
    {
        builder.HasKey(bs => bs.Id);
        builder.Property(bs => bs.Status).HasConversion<string>();
        builder.HasOne(bs => bs.Booking)
               .WithMany(b => b.BookingSeats)
               .HasForeignKey(bs => bs.BookingId)
               .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(bs => bs.Seat)
               .WithMany(s => s.BookingSeats)
               .HasForeignKey(bs => bs.SeatId)
               .OnDelete(DeleteBehavior.Restrict);
        // Denormalized ShowtimeId — kept in sync with Booking.ShowtimeId; needs referential integrity
        builder.HasOne<Showtime>()
               .WithMany()
               .HasForeignKey(bs => bs.ShowtimeId)
               .OnDelete(DeleteBehavior.Restrict);

        // Prevent double-booking: only one confirmed seat per (SeatId, ShowtimeId)
        builder.HasIndex(bs => new { bs.SeatId, bs.ShowtimeId })
               .IsUnique()
               .HasFilter("\"Status\" = 'Confirmed'");

        // Speed up expiry query: filter by Status + ExpiresAt
        builder.HasIndex(bs => new { bs.Status, bs.ExpiresAt });
    }
}
