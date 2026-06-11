using CinemaBooking.Domain.Enums;

namespace CinemaBooking.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Customer;

    public ICollection<Booking> Bookings { get; set; } = [];
}
