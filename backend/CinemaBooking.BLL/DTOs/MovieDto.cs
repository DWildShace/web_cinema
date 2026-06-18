namespace CinemaBooking.BLL.DTOs;

public record MovieDto(int Id, string Title, string Genre, int Duration, string PosterUrl, double Rating, string AgeRating, string Description);

public record CreateMovieDto(string Title, string Genre, int Duration, string PosterUrl, double Rating, string Description = "");

public record UpdateMovieDto(string? Title, string? Genre, int? Duration, string? PosterUrl, double? Rating, string? Description);
