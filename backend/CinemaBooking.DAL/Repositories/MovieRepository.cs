using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.DAL.Repositories;

public class MovieRepository(AppDbContext context) : BaseRepository<Movie>(context), IMovieRepository
{
    public async Task<IEnumerable<Movie>> GetByGenreAsync(string genre) =>
        await _dbSet.Where(m => m.Genre == genre).ToListAsync();
}
