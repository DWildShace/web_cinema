using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using CinemaBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.DAL.Repositories;

public class SeatRepository(AppDbContext context) : BaseRepository<Seat>(context), ISeatRepository
{
    public async Task<IEnumerable<Seat>> GetAvailableByShowtimeAsync(int showtimeId)
    {
        var takenSeatIds = await _context.BookingSeats
            .Where(bs => bs.ShowtimeId == showtimeId
                && (bs.Status == SeatStatus.Confirmed
                    || (bs.Status == SeatStatus.Pending
                        && (bs.ExpiresAt == null || bs.ExpiresAt > DateTime.UtcNow))))
            .Select(bs => bs.SeatId)
            .ToListAsync();

        var hallId = await _context.Showtimes
            .Where(s => s.Id == showtimeId)
            .Select(s => s.HallId)
            .FirstAsync();

        return await _context.Seats
            .Where(s => s.HallId == hallId && !takenSeatIds.Contains(s.Id))
            .OrderBy(s => s.Row).ThenBy(s => s.Column)
            .ToListAsync();
    }

    public async Task<Hall> GetHallByShowtimeAsync(int showtimeId) =>
        await _context.Showtimes
            .Where(s => s.Id == showtimeId)
            .Select(s => s.Hall)
            .FirstAsync();
}
