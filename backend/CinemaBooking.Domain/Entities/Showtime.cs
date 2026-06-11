namespace CinemaBooking.Domain.Entities;

public class Showtime
{
    public int Id { get; set; }
    public DateTime StartsAt { get; set; }
    public decimal Price { get; set; }

    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;

    public int HallId { get; set; }
    public Hall Hall { get; set; } = null!;

    public ICollection<Booking> Bookings { get; set; } = [];
}
