using CinemaBooking.Domain.Entities;

namespace CinemaBooking.DAL.Repositories.Interfaces;

public interface IBookingRepository : IRepository<Booking>
{
    Task<IEnumerable<Booking>> GetByUserIdAsync(int userId);
    Task<Booking?> GetByTicketCodeAsync(string ticketCode);
    Task<Booking?> GetWithSeatsAsync(int id);

    /// <summary>Returns active pending suggestions (all seats Pending, not expired) for a user+showtime+package.</summary>
    Task<IEnumerable<Booking>> GetActivePendingAsync(int userId, int showtimeId, int familyPackageId);

    /// <summary>Returns bookings that have at least one confirmed seat among the given seatIds for a showtime.</summary>
    Task<bool> AnyConfirmedForSeatsAsync(int showtimeId, IEnumerable<int> seatIds);
}
