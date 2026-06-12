using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using CinemaBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace CinemaBooking.DAL.Repositories;

public class BookingRepository(AppDbContext context) : BaseRepository<Booking>(context), IBookingRepository
{
    public async Task<IEnumerable<Booking>> GetByUserIdAsync(int userId) =>
        await _dbSet.Where(b => b.UserId == userId)
            .Include(b => b.Showtime).ThenInclude(s => s.Movie)
            .Include(b => b.BookingSeats).ThenInclude(bs => bs.Seat)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

    public async Task<Booking?> GetByTicketCodeAsync(string ticketCode) =>
        await _dbSet.FirstOrDefaultAsync(b => b.TicketCode == ticketCode);

    public async Task<Booking?> GetWithSeatsAsync(int id) =>
        await _dbSet
            .Include(b => b.BookingSeats).ThenInclude(bs => bs.Seat)
            .Include(b => b.Showtime).ThenInclude(s => s.Movie)
            .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<IEnumerable<Booking>> GetActivePendingAsync(int userId, int showtimeId, int familyPackageId) =>
        await _dbSet
            .Include(b => b.BookingSeats)
            .Where(b => b.UserId == userId
                && b.ShowtimeId == showtimeId
                && b.FamilyPackageId == familyPackageId
                // Must have seats AND none of them are non-Pending or expired
                && b.BookingSeats.Any()
                && !b.BookingSeats.Any(bs =>
                    bs.Status != SeatStatus.Pending
                    || (bs.ExpiresAt != null && bs.ExpiresAt <= DateTime.UtcNow)))
            .ToListAsync();

    public async Task<bool> AnyConfirmedForSeatsAsync(int showtimeId, IEnumerable<int> seatIds)
    {
        var ids = seatIds.ToList();
        return await _context.BookingSeats
            .Where(bs => bs.ShowtimeId == showtimeId
                && ids.Contains(bs.SeatId)
                && bs.Status == SeatStatus.Confirmed)
            .AnyAsync();
    }

    public Task<IDbContextTransaction> BeginTransactionAsync() =>
        _context.Database.BeginTransactionAsync();

    // Catches DB-level unique constraint violations (e.g. seat double-booking) and converts to
    // InvalidOperationException so the controller can return 409 instead of 500.
    public override async Task SaveChangesAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
            when (ex.InnerException?.Message.Contains("IX_BookingSeats_SeatId_ShowtimeId",
                      StringComparison.OrdinalIgnoreCase) == true
                  || ex.InnerException?.Message.Contains("unique",
                      StringComparison.OrdinalIgnoreCase) == true)
        {
            throw new InvalidOperationException(
                "Ghế vừa được đặt bởi người khác. Vui lòng thử lại.", ex);
        }
    }
}
