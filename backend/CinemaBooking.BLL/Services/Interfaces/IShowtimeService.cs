using CinemaBooking.BLL.DTOs;

namespace CinemaBooking.BLL.Services.Interfaces;

public interface IShowtimeService
{
    Task<IEnumerable<ShowtimeDto>> GetAllAsync();
    Task<IEnumerable<ShowtimeDto>> GetByDateAsync(DateOnly date);
    Task<IEnumerable<ShowtimeDto>> GetByMovieIdAsync(int movieId);
    Task<ShowtimeDto?> GetByIdAsync(int id);
    Task<ShowtimeDto> CreateAsync(CreateShowtimeDto dto);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<SeatWithStatusDto>> GetSeatsWithStatusAsync(int showtimeId);
}
