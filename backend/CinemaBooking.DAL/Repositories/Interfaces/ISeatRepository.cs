using CinemaBooking.Domain.Entities;

namespace CinemaBooking.DAL.Repositories.Interfaces;

public interface ISeatRepository : IRepository<Seat>
{
    Task<IEnumerable<Seat>> GetAvailableByShowtimeAsync(int showtimeId);
    Task<Hall> GetHallByShowtimeAsync(int showtimeId);
}
