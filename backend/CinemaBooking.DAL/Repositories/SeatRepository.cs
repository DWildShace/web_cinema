using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using CinemaBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.DAL.Repositories;

public class SeatRepository(AppDbContext context) : BaseRepository<Seat>(context), ISeatRepository
{
    public async Task<IEnumerable<Seat>> GetAvailableByShowtimeAsync(int showtimeId)
    {
        var now = DateTime.UtcNow;
        // Single atomic query: JOIN Seats→Showtimes for hall filter + NOT EXISTS for taken seats
        return await (
            from s in _context.Seats
            join st in _context.Showtimes on s.HallId equals st.HallId
            where st.Id == showtimeId
                && !_context.BookingSeats.Any(bs =>
                    bs.SeatId == s.Id
                    && bs.ShowtimeId == showtimeId
                    && (bs.Status == SeatStatus.Confirmed
                        || (bs.Status == SeatStatus.Pending
                            && (bs.ExpiresAt == null || bs.ExpiresAt > now))))
            orderby s.Row, s.Column
            select s
        ).ToListAsync();
    }

    public async Task<Hall> GetHallByShowtimeAsync(int showtimeId)
    {
        var hall = await _context.Showtimes
            .Where(s => s.Id == showtimeId)
            .Select(s => s.Hall)
            .FirstOrDefaultAsync();
        return hall ?? throw new KeyNotFoundException($"Showtime {showtimeId} not found.");
    }
}
