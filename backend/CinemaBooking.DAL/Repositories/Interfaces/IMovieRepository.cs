using CinemaBooking.Domain.Entities;

namespace CinemaBooking.DAL.Repositories.Interfaces;

public interface IMovieRepository : IRepository<Movie>
{
    Task<IEnumerable<Movie>> GetByGenreAsync(string genre);
}
