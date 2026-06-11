namespace CinemaBooking.BLL.DTOs;

public record ShowtimeDto(int Id, int MovieId, string MovieTitle, int HallId, string HallName, string CinemaName, DateTime StartsAt, decimal Price);

public record CreateShowtimeDto(int MovieId, int HallId, DateTime StartsAt, decimal Price);
