using CinemaBooking.Domain.Entities;

namespace CinemaBooking.DAL.Repositories.Interfaces;

public interface IShowtimeRepository : IRepository<Showtime>
{
    Task<IEnumerable<Showtime>> GetByMovieIdAsync(int movieId);
    Task<Showtime?> GetWithDetailsAsync(int id);
    /// <summary>Returns upcoming showtimes for the same movie (does NOT verify seat availability).</summary>
    Task<IEnumerable<Showtime>> GetAlternativeShowtimesAsync(int showtimeId);
}
