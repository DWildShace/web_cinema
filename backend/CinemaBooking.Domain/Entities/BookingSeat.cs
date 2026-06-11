using CinemaBooking.Domain.Enums;

namespace CinemaBooking.Domain.Entities;

public class BookingSeat
{
    public int Id { get; set; }
    public SeatStatus Status { get; set; } = SeatStatus.Pending;
    public DateTime? ExpiresAt { get; set; }

    public int BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    // Denormalized from Booking.ShowtimeId to enable DB-level unique constraint on (SeatId, ShowtimeId)
    public int ShowtimeId { get; set; }

    public int SeatId { get; set; }
    public Seat Seat { get; set; } = null!;
}
