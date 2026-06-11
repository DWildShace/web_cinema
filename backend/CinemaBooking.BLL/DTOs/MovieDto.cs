namespace CinemaBooking.BLL.DTOs;

public record MovieDto(int Id, string Title, string Genre, int Duration, string PosterUrl, double Rating, string AgeRating);

public record CreateMovieDto(string Title, string Genre, int Duration, string PosterUrl, double Rating);

public record UpdateMovieDto(string? Title, string? Genre, int? Duration, string? PosterUrl, double? Rating);
