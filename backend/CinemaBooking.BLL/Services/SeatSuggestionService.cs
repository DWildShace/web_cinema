using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;

namespace CinemaBooking.BLL.Services;

public class SeatSuggestionService(
    ISeatRepository seatRepo,
    IShowtimeRepository showtimeRepo) : ISeatSuggestionService
{
    public async Task<SeatSuggestionResult> SuggestAsync(int showtimeId, int seatCount)
    {
        var available = (await seatRepo.GetAvailableByShowtimeAsync(showtimeId)).ToList();
        var hall = await seatRepo.GetHallByShowtimeAsync(showtimeId);

        if (available.Count == 0)
        {
            var alts = await showtimeRepo.GetAlternativeShowtimesAsync(showtimeId);
            return new SeatSuggestionResult
            {
                IsFallback = true,
                FallbackMessage = "Suất chiếu này đã hết chỗ.",
                AlternativeShowtimeIds = alts.Select(s => s.Id).ToList(),
                HallRows = hall.Rows,
                HallColumns = hall.Columns
            };
        }

        var byRow = available
            .GroupBy(s => s.Row)
            .ToDictionary(g => g.Key, g => g.OrderBy(s => s.Column).ToList());

        var candidates = FindContiguousGroups(byRow, seatCount);

        if (candidates.Count > 0)
        {
            var best = ScoreAndSelect(candidates, hall.Rows, hall.Columns);
            return new SeatSuggestionResult { Seats = best, HallRows = hall.Rows, HallColumns = hall.Columns };
        }

        var fallback = FindFallbackGroups(byRow, seatCount);
        if (fallback is not null)
        {
            return new SeatSuggestionResult
            {
                Seats = fallback,
                IsFallback = true,
                FallbackMessage = $"Không còn {seatCount} ghế liền nhau — hệ thống đề xuất ghế ở 2 hàng kế tiếp.",
                HallRows = hall.Rows,
                HallColumns = hall.Columns
            };
        }

        var alternatives = await showtimeRepo.GetAlternativeShowtimesAsync(showtimeId);
        return new SeatSuggestionResult
        {
            IsFallback = true,
            FallbackMessage = "Không đủ ghế liền nhau. Vui lòng chọn suất chiếu khác.",
            HallRows = hall.Rows,
            HallColumns = hall.Columns,
            AlternativeShowtimeIds = alternatives.Select(s => s.Id).ToList()
        };
    }

    private static List<List<Seat>> FindContiguousGroups(
        Dictionary<int, List<Seat>> byRow, int n)
    {
        var result = new List<List<Seat>>();
        foreach (var seats in byRow.Values)
        {
            var run = new List<Seat> { seats[0] };
            for (int i = 1; i < seats.Count; i++)
            {
                if (seats[i].Column == seats[i - 1].Column + 1)
                    run.Add(seats[i]);
                else
                    run = [seats[i]];

                if (run.Count >= n)
                    result.Add(run.TakeLast(n).ToList());
            }
        }
        return result;
    }

    private static List<Seat>? FindFallbackGroups(
        Dictionary<int, List<Seat>> byRow, int n)
    {
        var sortedRows = byRow.Keys.OrderBy(r => r).ToList();
        for (int i = 0; i < sortedRows.Count - 1; i++)
        {
            int r1 = sortedRows[i], r2 = sortedRows[i + 1];
            if (r2 != r1 + 1) continue;

            var row1 = byRow[r1];
            var row2 = byRow[r2];

            for (int split = 1; split < n; split++)
            {
                if (row1.Count >= split && row2.Count >= n - split)
                    return [.. row1.Take(split), .. row2.Take(n - split)];
            }
        }
        return null;
    }

    private static List<Seat> ScoreAndSelect(
        List<List<Seat>> candidates, int totalRows, int totalColumns)
    {
        return candidates.MaxBy(group =>
        {
            float rowRatio = (float)group[0].Row / totalRows;
            int rowScore = rowRatio is >= 0.3f and <= 0.6f ? 30 : 0;

            float colRatio = (float)(group.Sum(s => s.Column) / group.Count) / totalColumns;
            int colScore = colRatio is >= 0.2f and <= 0.8f ? 20 : 0;

            int wallScore = group[0].Column > 1 && group[^1].Column < totalColumns ? 10 : 0;

            return rowScore + colScore + wallScore;
        })!;
    }
}
