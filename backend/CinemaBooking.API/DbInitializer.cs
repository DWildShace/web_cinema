using CinemaBooking.DAL;
using CinemaBooking.Domain.Entities;
using CinemaBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.API;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Movies.AnyAsync()) return;

        // ── Cinemas & Halls ──────────────────────────────────────────────
        var cgv = new Cinema { Name = "CGV Vincom Đồng Khởi", Location = "72 Lê Thánh Tôn, Quận 1, TP.HCM" };
        var lotte = new Cinema { Name = "Lotte Cinema Nowzone", Location = "235 Nguyễn Văn Cừ, Quận 1, TP.HCM" };

        await db.Cinemas.AddRangeAsync(cgv, lotte);
        await db.SaveChangesAsync();

        var hallA = new Hall { Name = "Phòng A", Rows = 8, Columns = 12, CinemaId = cgv.Id };
        var hallVip = new Hall { Name = "Phòng VIP", Rows = 5, Columns = 8, CinemaId = cgv.Id };
        var hallLotte1 = new Hall { Name = "Phòng 1", Rows = 7, Columns = 10, CinemaId = lotte.Id };

        await db.Halls.AddRangeAsync(hallA, hallVip, hallLotte1);
        await db.SaveChangesAsync();

        // ── Seats ────────────────────────────────────────────────────────
        var seats = new List<Seat>();
        foreach (var (hall, type) in new[] {
            (hallA,     SeatType.Standard),
            (hallVip,   SeatType.VIP),
            (hallLotte1, SeatType.Standard)
        })
        {
            for (var r = 1; r <= hall.Rows; r++)
                for (var c = 1; c <= hall.Columns; c++)
                    seats.Add(new Seat { HallId = hall.Id, Row = r, Column = c, Type = type });
        }

        await db.Seats.AddRangeAsync(seats);
        await db.SaveChangesAsync();

        // ── Movies ───────────────────────────────────────────────────────
        var movies = new List<Movie>
        {
            new() { Title = "Avengers: Infinity War",   Genre = "Hành Động",       Duration = 149, Rating = 8.4f, AgeRating = AgeRating.T13, PosterUrl = "https://image.tmdb.org/t/p/w300/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg" },
            new() { Title = "Inside Out 2",              Genre = "Hoạt Hình",       Duration = 100, Rating = 7.8f, AgeRating = AgeRating.K,   PosterUrl = "https://image.tmdb.org/t/p/w300/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg" },
            new() { Title = "Dune: Part Two",            Genre = "Khoa Học Viễn Tưởng", Duration = 166, Rating = 8.5f, AgeRating = AgeRating.T13, PosterUrl = "https://image.tmdb.org/t/p/w300/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg" },
            new() { Title = "Godzilla x Kong",          Genre = "Hành Động",       Duration = 115, Rating = 6.8f, AgeRating = AgeRating.T13, PosterUrl = "https://image.tmdb.org/t/p/w300/tMefBSflR6PGQLv7WvFPpKLZkyk.jpg" },
            new() { Title = "Cậu Bé Và Chim Diệc",     Genre = "Hoạt Hình",       Duration = 124, Rating = 7.6f, AgeRating = AgeRating.K,   PosterUrl = "https://image.tmdb.org/t/p/w300/f32eite2JqGvjwATDLhCNqkjuKA.jpg" },
            new() { Title = "Cô Gái Từ Quá Khứ",       Genre = "Tâm Lý / Tình Cảm", Duration = 119, Rating = 7.2f, AgeRating = AgeRating.T13, PosterUrl = "https://placehold.co/300x450?text=Co+Gai+Tu+Qua+Khu" },
        };
        await db.Movies.AddRangeAsync(movies);
        await db.SaveChangesAsync();

        // ── Showtimes ────────────────────────────────────────────────────
        var base1 = DateTime.UtcNow.Date.AddDays(1);
        var showtimes = new List<Showtime>
        {
            // Avengers – CGV Hall A
            new() { MovieId = movies[0].Id, HallId = hallA.Id,     StartsAt = base1.AddHours(9),  Price = 90_000 },
            new() { MovieId = movies[0].Id, HallId = hallA.Id,     StartsAt = base1.AddHours(14), Price = 110_000 },
            new() { MovieId = movies[0].Id, HallId = hallA.Id,     StartsAt = base1.AddDays(1).AddHours(19), Price = 120_000 },
            // Inside Out 2 – CGV Hall A & Lotte
            new() { MovieId = movies[1].Id, HallId = hallA.Id,     StartsAt = base1.AddHours(10), Price = 85_000 },
            new() { MovieId = movies[1].Id, HallId = hallLotte1.Id, StartsAt = base1.AddHours(13), Price = 90_000 },
            new() { MovieId = movies[1].Id, HallId = hallLotte1.Id, StartsAt = base1.AddDays(1).AddHours(16), Price = 95_000 },
            // Dune: Part Two – VIP
            new() { MovieId = movies[2].Id, HallId = hallVip.Id,   StartsAt = base1.AddHours(18), Price = 180_000 },
            new() { MovieId = movies[2].Id, HallId = hallVip.Id,   StartsAt = base1.AddDays(1).AddHours(21), Price = 200_000 },
            // Godzilla x Kong – Lotte
            new() { MovieId = movies[3].Id, HallId = hallLotte1.Id, StartsAt = base1.AddHours(11), Price = 100_000 },
            new() { MovieId = movies[3].Id, HallId = hallLotte1.Id, StartsAt = base1.AddHours(20), Price = 110_000 },
            // Cậu Bé Và Chim Diệc – CGV Hall A
            new() { MovieId = movies[4].Id, HallId = hallA.Id,     StartsAt = base1.AddHours(8),  Price = 85_000 },
            new() { MovieId = movies[4].Id, HallId = hallA.Id,     StartsAt = base1.AddDays(2).AddHours(10), Price = 85_000 },
            // Cô Gái Từ Quá Khứ – Lotte
            new() { MovieId = movies[5].Id, HallId = hallLotte1.Id, StartsAt = base1.AddHours(15), Price = 95_000 },
            new() { MovieId = movies[5].Id, HallId = hallLotte1.Id, StartsAt = base1.AddDays(1).AddHours(18), Price = 100_000 },
        };
        await db.Showtimes.AddRangeAsync(showtimes);
        await db.SaveChangesAsync();

        // ── Family Packages ──────────────────────────────────────────────
        var packages = new List<FamilyPackage>
        {
            new() { Name = "Combo Gia Đình Nhỏ",    AdultCount = 2, ChildCount = 2, DiscountPct = 0.15m },
            new() { Name = "Combo Gia Đình Lớn",    AdultCount = 2, ChildCount = 3, DiscountPct = 0.20m },
            new() { Name = "Combo Hai Thế Hệ",      AdultCount = 1, ChildCount = 3, DiscountPct = 0.10m },
        };
        await db.FamilyPackages.AddRangeAsync(packages);
        await db.SaveChangesAsync();

        // ── Users ────────────────────────────────────────────────────────
        var users = new List<User>
        {
            new() { Email = "admin@cinema.vn",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),    Role = UserRole.Admin },
            new() { Email = "user@cinema.vn",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),     Role = UserRole.Customer },
        };
        await db.Users.AddRangeAsync(users);
        await db.SaveChangesAsync();
    }
}
