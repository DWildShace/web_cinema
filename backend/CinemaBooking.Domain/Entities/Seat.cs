using CinemaBooking.Domain.Enums;

namespace CinemaBooking.Domain.Entities;

public class Seat
{
    public int Id { get; set; }
    public int Row { get; set; }
    public int Column { get; set; }
    public SeatType Type { get; set; } = SeatType.Standard;

    public int HallId { get; set; }
    public Hall Hall { get; set; } = null!;

    public ICollection<BookingSeat> BookingSeats { get; set; } = [];
}
