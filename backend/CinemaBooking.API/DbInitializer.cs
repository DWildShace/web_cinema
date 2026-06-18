using CinemaBooking.DAL;
using CinemaBooking.Domain.Entities;
using CinemaBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.API;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext db, IWebHostEnvironment env, bool forceSeed = false)
    {
        if (forceSeed)
        {
            // Xóa showtimes + dữ liệu phụ thuộc (BookingSeats → Bookings → Showtimes)
            await db.Database.ExecuteSqlRawAsync(@"
                TRUNCATE TABLE ""BookingSeats"", ""Bookings"", ""Showtimes"" RESTART IDENTITY CASCADE
            ");
        }

        var isFirstRun = !await db.Movies.AnyAsync();

        if (isFirstRun)
        {
            // ── Cinemas & Halls ──────────────────────────────────────────────
            var cgv   = new Cinema { Name = "CGV Vincom Đồng Khởi",  Location = "72 Lê Thánh Tôn, Quận 1, TP.HCM" };
            var lotte = new Cinema { Name = "Lotte Cinema Nowzone",   Location = "235 Nguyễn Văn Cừ, Quận 1, TP.HCM" };

            await db.Cinemas.AddRangeAsync(cgv, lotte);
            await db.SaveChangesAsync();

            var hallA     = new Hall { Name = "Phòng A",   Rows = 8, Columns = 12, CinemaId = cgv.Id };
            var hallVip   = new Hall { Name = "Phòng VIP", Rows = 5, Columns = 8,  CinemaId = cgv.Id };
            var hallLotte = new Hall { Name = "Phòng 1",   Rows = 7, Columns = 10, CinemaId = lotte.Id };

            await db.Halls.AddRangeAsync(hallA, hallVip, hallLotte);
            await db.SaveChangesAsync();

            // ── Seats ────────────────────────────────────────────────────────
            var seats = new List<Seat>();
            foreach (var (hall, type) in new[] {
                (hallA,     SeatType.Standard),
                (hallVip,   SeatType.VIP),
                (hallLotte, SeatType.Standard)
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
                new() { Title = "Avengers: Infinity War",      Genre = "Hành Động",             Duration = 149, Rating = 8.4f, AgeRating = AgeRating.T13, PosterUrl = "https://image.tmdb.org/t/p/w300/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg" },
                new() { Title = "Inside Out 2",                Genre = "Hoạt Hình",             Duration = 100, Rating = 7.8f, AgeRating = AgeRating.K,   PosterUrl = "https://image.tmdb.org/t/p/w300/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg" },
                new() { Title = "Dune: Part Two",              Genre = "Khoa Học Viễn Tưởng",   Duration = 166, Rating = 8.5f, AgeRating = AgeRating.T13, PosterUrl = "https://image.tmdb.org/t/p/w300/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg" },
                new() { Title = "Godzilla x Kong",             Genre = "Hành Động",             Duration = 115, Rating = 6.8f, AgeRating = AgeRating.T13, PosterUrl = "https://image.tmdb.org/t/p/w300/tMefBSflR6PGQLv7WvFPpKLZkyk.jpg" },
                new() { Title = "Cậu Bé Và Chim Diệc",        Genre = "Hoạt Hình",             Duration = 124, Rating = 7.6f, AgeRating = AgeRating.K,   PosterUrl = "https://image.tmdb.org/t/p/w300/f32eite2JqGvjwATDLhCNqkjuKA.jpg" },
                new() { Title = "Cô Gái Từ Quá Khứ",          Genre = "Tâm Lý / Tình Cảm",     Duration = 119, Rating = 7.2f, AgeRating = AgeRating.T13, PosterUrl = "https://placehold.co/300x450?text=Co+Gai+Tu+Qua+Khu" },
            };
            await db.Movies.AddRangeAsync(movies);
            await db.SaveChangesAsync();

            // ── Family Packages ──────────────────────────────────────────────
            var packages = new List<FamilyPackage>
            {
                new() { Name = "Combo Gia Đình Nhỏ",  AdultCount = 2, ChildCount = 2, DiscountPct = 0.15m },
                new() { Name = "Combo Gia Đình Lớn",  AdultCount = 2, ChildCount = 3, DiscountPct = 0.20m },
                new() { Name = "Combo Hai Thế Hệ",    AdultCount = 1, ChildCount = 3, DiscountPct = 0.10m },
            };
            await db.FamilyPackages.AddRangeAsync(packages);
            await db.SaveChangesAsync();
        }

        // ── Showtimes: re-seed whenever no future showtimes exist ────────────
        // This runs on every startup, so showtimes are always valid regardless of when DB was created.
        var hasFutureShowtimes = await db.Showtimes.AnyAsync(s => s.StartsAt > DateTime.UtcNow);
        if (!hasFutureShowtimes)
        {
            var allMovies = await db.Movies.OrderBy(m => m.Id).ToListAsync();
            var allHalls  = await db.Halls.OrderBy(h => h.Id).ToListAsync();

            if (allMovies.Count >= 6 && allHalls.Count >= 3)
            {
                var hallA     = allHalls[0];
                var hallVip   = allHalls[1];
                var hallLotte = allHalls[2];

                var t = DateTime.UtcNow.Date.AddDays(1); // base = tomorrow 00:00 UTC
                var showtimes = new List<Showtime>
                {
                    // Avengers – CGV Hall A (days +1, +2, +3)
                    new() { MovieId = allMovies[0].Id, HallId = hallA.Id,     StartsAt = t.AddHours(9),             Price = 90_000 },
                    new() { MovieId = allMovies[0].Id, HallId = hallA.Id,     StartsAt = t.AddHours(14),            Price = 110_000 },
                    new() { MovieId = allMovies[0].Id, HallId = hallA.Id,     StartsAt = t.AddDays(1).AddHours(19), Price = 120_000 },
                    new() { MovieId = allMovies[0].Id, HallId = hallA.Id,     StartsAt = t.AddDays(2).AddHours(11), Price = 110_000 },
                    // Inside Out 2 – CGV Hall A & Lotte (days +1, +2, +3)
                    new() { MovieId = allMovies[1].Id, HallId = hallA.Id,     StartsAt = t.AddHours(10),            Price = 85_000 },
                    new() { MovieId = allMovies[1].Id, HallId = hallLotte.Id, StartsAt = t.AddHours(13),            Price = 90_000 },
                    new() { MovieId = allMovies[1].Id, HallId = hallLotte.Id, StartsAt = t.AddDays(1).AddHours(16), Price = 95_000 },
                    new() { MovieId = allMovies[1].Id, HallId = hallA.Id,     StartsAt = t.AddDays(3).AddHours(10), Price = 85_000 },
                    // Dune: Part Two – VIP (days +1, +2, +3)
                    new() { MovieId = allMovies[2].Id, HallId = hallVip.Id,   StartsAt = t.AddHours(18),            Price = 180_000 },
                    new() { MovieId = allMovies[2].Id, HallId = hallVip.Id,   StartsAt = t.AddDays(1).AddHours(21), Price = 200_000 },
                    new() { MovieId = allMovies[2].Id, HallId = hallVip.Id,   StartsAt = t.AddDays(2).AddHours(18), Price = 180_000 },
                    // Godzilla x Kong – Lotte (days +1, +2, +4)
                    new() { MovieId = allMovies[3].Id, HallId = hallLotte.Id, StartsAt = t.AddHours(11),            Price = 100_000 },
                    new() { MovieId = allMovies[3].Id, HallId = hallLotte.Id, StartsAt = t.AddHours(20),            Price = 110_000 },
                    new() { MovieId = allMovies[3].Id, HallId = hallLotte.Id, StartsAt = t.AddDays(2).AddHours(14), Price = 105_000 },
                    // Cậu Bé Và Chim Diệc – Hall A & Lotte (days +1, +2, +4)
                    new() { MovieId = allMovies[4].Id, HallId = hallA.Id,     StartsAt = t.AddHours(8),             Price = 85_000 },
                    new() { MovieId = allMovies[4].Id, HallId = hallA.Id,     StartsAt = t.AddDays(2).AddHours(10), Price = 85_000 },
                    new() { MovieId = allMovies[4].Id, HallId = hallLotte.Id, StartsAt = t.AddDays(3).AddHours(9),  Price = 85_000 },
                    // Cô Gái Từ Quá Khứ – Lotte & VIP (days +1, +2, +4)
                    new() { MovieId = allMovies[5].Id, HallId = hallLotte.Id, StartsAt = t.AddHours(15),            Price = 95_000 },
                    new() { MovieId = allMovies[5].Id, HallId = hallLotte.Id, StartsAt = t.AddDays(1).AddHours(18), Price = 100_000 },
                    new() { MovieId = allMovies[5].Id, HallId = hallVip.Id,   StartsAt = t.AddDays(3).AddHours(20), Price = 150_000 },
                };
                await db.Showtimes.AddRangeAsync(showtimes);
                await db.SaveChangesAsync();
            }
        }

        // ── Dev-only seed users (never in production) ────────────────────────
        if (env.IsDevelopment() && !await db.Users.AnyAsync())
        {
            var users = new List<User>
            {
                new() { Email = "admin@cinema.vn",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),    Role = UserRole.Admin },
                new() { Email = "user@cinema.vn",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),     Role = UserRole.Customer },
                new() { Email = "manager@cinema.vn",  PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager@123"),  Role = UserRole.CinemaManager },
                new() { Email = "staff@cinema.vn",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@123"),    Role = UserRole.CinemaStaff },
                new() { Email = "sysadmin@cinema.vn", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Sysadmin@123"), Role = UserRole.SysAdmin },
            };
            await db.Users.AddRangeAsync(users);
            await db.SaveChangesAsync();
        }
    }
}
