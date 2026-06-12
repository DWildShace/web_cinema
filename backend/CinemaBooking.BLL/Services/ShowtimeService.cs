using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;

namespace CinemaBooking.BLL.Services;

public class ShowtimeService(IShowtimeRepository showtimeRepo, ISeatRepository seatRepo) : IShowtimeService
{
    public async Task<IEnumerable<ShowtimeDto>> GetByMovieIdAsync(int movieId)
    {
        var showtimes = await showtimeRepo.GetByMovieIdAsync(movieId);
        return showtimes.Select(ToDto);
    }

    public async Task<ShowtimeDto?> GetByIdAsync(int id)
    {
        var showtime = await showtimeRepo.GetWithDetailsAsync(id);
        return showtime is null ? null : ToDto(showtime);
    }

    public async Task<ShowtimeDto> CreateAsync(CreateShowtimeDto dto)
    {
        var showtime = new Showtime
        {
            MovieId = dto.MovieId,
            HallId = dto.HallId,
            StartsAt = dto.StartsAt.ToUniversalTime(),
            Price = dto.Price
        };
        await showtimeRepo.AddAsync(showtime);
        await showtimeRepo.SaveChangesAsync();

        var full = await showtimeRepo.GetWithDetailsAsync(showtime.Id);
        return ToDto(full!);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var showtime = await showtimeRepo.GetByIdAsync(id);
        if (showtime is null) return false;
        showtimeRepo.Remove(showtime);
        await showtimeRepo.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<SeatWithStatusDto>> GetSeatsWithStatusAsync(int showtimeId)
    {
        var showtime = await showtimeRepo.GetWithDetailsAsync(showtimeId)
            ?? throw new KeyNotFoundException("Suất chiếu không tồn tại.");

        var allSeats = await seatRepo.FindAsync(s => s.HallId == showtime.HallId);
        var availableIds = (await seatRepo.GetAvailableByShowtimeAsync(showtimeId))
            .Select(s => s.Id).ToHashSet();

        return allSeats
            .OrderBy(s => s.Row).ThenBy(s => s.Column)
            .Select(s => new SeatWithStatusDto(s.Id, s.Row, s.Column, s.Type.ToString(), availableIds.Contains(s.Id)));
    }

    private static ShowtimeDto ToDto(Showtime s) => new(
        s.Id,
        s.MovieId,
        s.Movie?.Title ?? string.Empty,
        s.HallId,
        s.Hall?.Name ?? string.Empty,
        s.Hall?.Cinema?.Name ?? string.Empty,
        s.StartsAt,
        s.Price
    );
}
