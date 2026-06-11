namespace CinemaBooking.Domain.Entities;

public class Booking
{
    public int Id { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ShowtimeId { get; set; }
    public Showtime Showtime { get; set; } = null!;

    public ICollection<BookingSeat> BookingSeats { get; set; } = [];

    public int? FamilyPackageId { get; set; }
    public FamilyPackage? FamilyPackage { get; set; }
}
