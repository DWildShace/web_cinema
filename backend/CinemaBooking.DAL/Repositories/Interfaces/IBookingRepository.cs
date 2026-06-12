using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace CinemaBooking.DAL.Repositories.Interfaces;

public interface IBookingRepository : IRepository<Booking>
{
    Task<IEnumerable<Booking>> GetByUserIdAsync(int userId);
    Task<Booking?> GetByTicketCodeAsync(string ticketCode);
    Task<Booking?> GetWithSeatsAsync(int id);

    /// <summary>Returns active pending suggestions (all seats Pending, not expired) for a user+showtime+package.</summary>
    Task<IEnumerable<Booking>> GetActivePendingAsync(int userId, int showtimeId, int familyPackageId);

    /// <summary>Returns true if any of the given seats are already confirmed for a showtime.</summary>
    Task<bool> AnyConfirmedForSeatsAsync(int showtimeId, IEnumerable<int> seatIds);

    /// <summary>Begins a database transaction for atomic multi-step operations.</summary>
    Task<IDbContextTransaction> BeginTransactionAsync();
}
