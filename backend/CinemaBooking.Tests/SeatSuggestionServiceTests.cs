using CinemaBooking.BLL.Services;
using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using CinemaBooking.Domain.Enums;
using Moq;

namespace CinemaBooking.Tests;

public class SeatSuggestionServiceTests
{
    private static Hall MakeHall(int rows, int cols) =>
        new() { Id = 1, Rows = rows, Columns = cols };

    private static List<Seat> MakeSeats(Hall hall) =>
        Enumerable.Range(1, hall.Rows)
            .SelectMany(r => Enumerable.Range(1, hall.Columns)
                .Select(c => new Seat
                {
                    Id = (r - 1) * hall.Columns + c,
                    Row = r,
                    Column = c,
                    HallId = hall.Id,
                    Type = SeatType.Standard
                }))
            .ToList();

    [Fact]
    public async Task SuggestAsync_AllSeatsAvailable_ReturnsFourAdjacentInSameRow()
    {
        var hall = MakeHall(10, 10);
        var seats = MakeSeats(hall);

        var seatRepo = new Mock<ISeatRepository>();
        seatRepo.Setup(r => r.GetAvailableByShowtimeAsync(1)).ReturnsAsync(seats);
        seatRepo.Setup(r => r.GetHallByShowtimeAsync(1)).ReturnsAsync(hall);

        var service = new SeatSuggestionService(seatRepo.Object, Mock.Of<IShowtimeRepository>());
        var result = await service.SuggestAsync(showtimeId: 1, seatCount: 4);

        Assert.Equal(4, result.Seats.Count);
        Assert.False(result.IsFallback);
        Assert.Single(result.Seats.Select(s => s.Row).Distinct());

        var cols = result.Seats.Select(s => s.Column).OrderBy(c => c).ToList();
        for (int i = 1; i < cols.Count; i++)
            Assert.Equal(cols[i - 1] + 1, cols[i]);
    }

    [Fact]
    public async Task SuggestAsync_PrefersMiddleRows_OverTopRows()
    {
        var hall = MakeHall(10, 10);
        // Only rows 1 and 5 have available seats
        var seats = MakeSeats(hall).Where(s => s.Row == 1 || s.Row == 5).ToList();

        var seatRepo = new Mock<ISeatRepository>();
        seatRepo.Setup(r => r.GetAvailableByShowtimeAsync(1)).ReturnsAsync(seats);
        seatRepo.Setup(r => r.GetHallByShowtimeAsync(1)).ReturnsAsync(hall);

        var service = new SeatSuggestionService(seatRepo.Object, Mock.Of<IShowtimeRepository>());
        var result = await service.SuggestAsync(showtimeId: 1, seatCount: 4);

        Assert.All(result.Seats, s => Assert.Equal(5, s.Row));
    }

    [Fact]
    public async Task SuggestAsync_NoSingleRowContiguous_ReturnsFallbackTwoRows()
    {
        var hall = MakeHall(10, 10);
        // Only 2 seats available in row 4 and 2 in row 5 — cannot satisfy 4 in one row
        var seats = new List<Seat>
        {
            new() { Id = 1, Row = 4, Column = 4, HallId = 1, Type = SeatType.Standard },
            new() { Id = 2, Row = 4, Column = 5, HallId = 1, Type = SeatType.Standard },
            new() { Id = 3, Row = 5, Column = 4, HallId = 1, Type = SeatType.Standard },
            new() { Id = 4, Row = 5, Column = 5, HallId = 1, Type = SeatType.Standard },
        };

        var seatRepo = new Mock<ISeatRepository>();
        seatRepo.Setup(r => r.GetAvailableByShowtimeAsync(1)).ReturnsAsync(seats);
        seatRepo.Setup(r => r.GetHallByShowtimeAsync(1)).ReturnsAsync(hall);

        var service = new SeatSuggestionService(seatRepo.Object, Mock.Of<IShowtimeRepository>());
        var result = await service.SuggestAsync(showtimeId: 1, seatCount: 4);

        Assert.Equal(4, result.Seats.Count);
        Assert.True(result.IsFallback);
        Assert.NotNull(result.FallbackMessage);
    }

    [Fact]
    public async Task SuggestAsync_NoSeatsAvailable_ReturnsAlternativeShowtimes()
    {
        var hall = MakeHall(10, 10);
        var altShowtimes = new List<Showtime>
        {
            new() { Id = 2, MovieId = 1, HallId = 1, StartsAt = DateTime.UtcNow.AddHours(3), Price = 100 },
            new() { Id = 3, MovieId = 1, HallId = 1, StartsAt = DateTime.UtcNow.AddHours(6), Price = 100 },
        };

        var seatRepo = new Mock<ISeatRepository>();
        seatRepo.Setup(r => r.GetAvailableByShowtimeAsync(1)).ReturnsAsync([]);
        seatRepo.Setup(r => r.GetHallByShowtimeAsync(1)).ReturnsAsync(hall);

        var showtimeRepo = new Mock<IShowtimeRepository>();
        showtimeRepo.Setup(r => r.GetAlternativeShowtimesAsync(1)).ReturnsAsync(altShowtimes);

        var service = new SeatSuggestionService(seatRepo.Object, showtimeRepo.Object);
        var result = await service.SuggestAsync(showtimeId: 1, seatCount: 4);

        Assert.Empty(result.Seats);
        Assert.True(result.IsFallback);
        Assert.Equal(2, result.AlternativeShowtimeIds.Count);
    }
}
