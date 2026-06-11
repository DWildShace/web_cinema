using CinemaBooking.Domain.Entities;

namespace CinemaBooking.BLL.Services.Interfaces;

public interface ISeatSuggestionService
{
    Task<SeatSuggestionResult> SuggestAsync(int showtimeId, int seatCount);
}

public class SeatSuggestionResult
{
    public IReadOnlyList<Seat> Seats { get; init; } = [];
    public bool IsFallback { get; init; }
    public string? FallbackMessage { get; init; }
    public IReadOnlyList<int> AlternativeShowtimeIds { get; init; } = [];
    public int HallRows { get; init; }
    public int HallColumns { get; init; }
}
