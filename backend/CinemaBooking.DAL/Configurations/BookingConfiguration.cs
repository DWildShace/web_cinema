using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemaBooking.DAL.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.HasKey(b => b.Id);
        builder.Property(b => b.TicketCode).IsRequired().HasMaxLength(50);
        builder.HasIndex(b => b.TicketCode).IsUnique();
        builder.HasOne(b => b.User)
               .WithMany(u => u.Bookings)
               .HasForeignKey(b => b.UserId)
               .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(b => b.Showtime)
               .WithMany(s => s.Bookings)
               .HasForeignKey(b => b.ShowtimeId)
               .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(b => b.FamilyPackage)
               .WithMany(f => f.Bookings)
               .HasForeignKey(b => b.FamilyPackageId)
               .OnDelete(DeleteBehavior.SetNull)
               .IsRequired(false);
    }
}
