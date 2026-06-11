namespace CinemaBooking.Domain.Entities;

public class FamilyPackage
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int AdultCount { get; set; }
    public int ChildCount { get; set; }
    public decimal DiscountPct { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Booking> Bookings { get; set; } = [];
}
