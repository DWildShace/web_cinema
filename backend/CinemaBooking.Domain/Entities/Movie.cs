using CinemaBooking.Domain.Enums;

namespace CinemaBooking.Domain.Entities;

public class Movie
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public int Duration { get; set; }
    public string PosterUrl { get; set; } = string.Empty;
    public double Rating { get; set; }
    public AgeRating AgeRating { get; set; } = AgeRating.P;

    public ICollection<Showtime> Showtimes { get; set; } = [];
}
