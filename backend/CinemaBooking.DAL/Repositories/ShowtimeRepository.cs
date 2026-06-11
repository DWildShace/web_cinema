using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.DAL.Repositories;

public class ShowtimeRepository(AppDbContext context) : BaseRepository<Showtime>(context), IShowtimeRepository
{
    public async Task<IEnumerable<Showtime>> GetByMovieIdAsync(int movieId) =>
        await _dbSet.Where(s => s.MovieId == movieId).Include(s => s.Hall).ToListAsync();

    public async Task<Showtime?> GetWithDetailsAsync(int id) =>
        await _dbSet
            .Include(s => s.Movie)
            .Include(s => s.Hall).ThenInclude(h => h.Cinema)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<Showtime>> GetAlternativeShowtimesAsync(int showtimeId)
    {
        var current = await _dbSet.FindAsync(showtimeId);
        if (current is null) return [];

        return await _dbSet
            .Where(s => s.Id != showtimeId
                && s.MovieId == current.MovieId
                && s.StartsAt > DateTime.UtcNow)
            .OrderBy(s => s.StartsAt)
            .Take(3)
            .ToListAsync();
    }
}
