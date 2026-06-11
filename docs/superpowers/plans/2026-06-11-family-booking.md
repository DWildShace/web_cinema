# Family Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây tính năng đặt vé gia đình gồm gói giá (2 NL+1TE / 2NL+2TE / 1NL+2TE) và tự động chọn N ghế liền nhau tốt nhất.

**Architecture:** Backend .NET 10 thêm entity `FamilyPackage`, thuật toán chọn ghế trong `SeatSuggestionService` (BLL), background service xóa lock hết hạn, 8 endpoints mới. Frontend React 18 + Vite + Bun + Tailwind v4, feature-based tại `features/family-booking/`.

**Tech Stack:** .NET 10, EF Core 10 + Npgsql, AutoMapper 16, xUnit + Moq (tests), React 18, TypeScript, Vite, Bun, Tailwind CSS v4, Zustand, Axios.

---

## File Map

### Backend — tạo mới
| File | Trách nhiệm |
|------|------------|
| `Domain/Enums/AgeRating.cs` | Enum P/K/T13/T16/T18 |
| `Domain/Entities/FamilyPackage.cs` | Entity gói gia đình |
| `DAL/Configurations/FamilyPackageConfiguration.cs` | EF fluent config |
| `DAL/Repositories/Interfaces/ISeatRepository.cs` | Interface repo ghế |
| `DAL/Repositories/SeatRepository.cs` | Query ghế còn trống theo suất |
| `BLL/DTOs/FamilyPackageDto.cs` | DTOs cho gói + suggestion |
| `BLL/Services/Interfaces/ISeatSuggestionService.cs` | Interface thuật toán ghế |
| `BLL/Services/SeatSuggestionService.cs` | Thuật toán chọn ghế liền nhau |
| `BLL/Services/Interfaces/IFamilyPackageService.cs` | Interface CRUD gói |
| `BLL/Services/FamilyPackageService.cs` | CRUD gói gia đình |
| `BLL/Services/Interfaces/IFamilyBookingService.cs` | Interface đặt vé gia đình |
| `BLL/Services/FamilyBookingService.cs` | Orchestrate luồng đặt vé |
| `API/BackgroundServices/SeatExpiryService.cs` | Release ghế Pending hết hạn |
| `API/Controllers/FamilyPackagesController.cs` | CRUD gói (Admin) |
| `API/Controllers/FamilyBookingController.cs` | 4 endpoints luồng đặt vé |
| `Tests/CinemaBooking.Tests.csproj` | xUnit project |
| `Tests/SeatSuggestionServiceTests.cs` | Unit tests thuật toán |

### Backend — sửa
| File | Thay đổi |
|------|---------|
| `Domain/Entities/Movie.cs` | Thêm `AgeRating` |
| `Domain/Entities/Booking.cs` | Thêm `FamilyPackageId?` + nav prop |
| `DAL/Configurations/MovieConfiguration.cs` | Config `AgeRating` |
| `DAL/Configurations/BookingConfiguration.cs` | Config FK nullable |
| `DAL/AppDbContext.cs` | Thêm `DbSet<FamilyPackage>` |
| `BLL/Mappings/MovieProfile.cs` | Map `AgeRating` |
| `API/Program.cs` | Đăng ký services + BackgroundService |

### Frontend — tạo mới
| File | Trách nhiệm |
|------|------------|
| `frontend/` (toàn bộ) | Vite + React + Bun scaffold |
| `src/api/familyBooking.ts` | Axios calls 4 endpoints |
| `src/features/family-booking/components/AgeRatingBadge.tsx` | Nhãn P/K/T13 |
| `src/features/family-booking/components/FamilyPackageCard.tsx` | Card gói lớn |
| `src/features/family-booking/components/SeatMapPreview.tsx` | Sơ đồ rạp |
| `src/features/family-booking/components/FallbackShowtimeSuggest.tsx` | Gợi ý suất khác |
| `src/features/family-booking/hooks/useFamilyPackages.ts` | Fetch gói |
| `src/features/family-booking/hooks/useSuggestSeats.ts` | Suggest + countdown |
| `src/features/family-booking/pages/FamilyMovieListPage.tsx` | Bước 1 |
| `src/features/family-booking/pages/FamilyPackagePickerPage.tsx` | Bước 2 |
| `src/features/family-booking/pages/FamilyConfirmPage.tsx` | Bước 3 |
| `src/App.tsx` | Routes |

---

## Task 1: Domain — FamilyPackage entity + AgeRating enum + sửa Movie/Booking

**Files:**
- Create: `backend/CinemaBooking.Domain/Enums/AgeRating.cs`
- Create: `backend/CinemaBooking.Domain/Entities/FamilyPackage.cs`
- Modify: `backend/CinemaBooking.Domain/Entities/Movie.cs`
- Modify: `backend/CinemaBooking.Domain/Entities/Booking.cs`

- [ ] **Tạo `AgeRating.cs`**

```csharp
namespace CinemaBooking.Domain.Enums;

public enum AgeRating
{
    P,
    K,
    T13,
    T16,
    T18
}
```

- [ ] **Tạo `FamilyPackage.cs`**

```csharp
namespace CinemaBooking.Domain.Entities;

public class FamilyPackage
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int AdultCount { get; set; }
    public int ChildCount { get; set; }
    public decimal DiscountPct { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Booking> Bookings { get; set; } = [];
}
```

- [ ] **Sửa `Movie.cs` — thêm AgeRating**

Thêm vào cuối các property:
```csharp
public AgeRating AgeRating { get; set; } = AgeRating.P;
```
Import: `using CinemaBooking.Domain.Enums;`

- [ ] **Sửa `Booking.cs` — thêm FamilyPackageId**

Thêm vào cuối:
```csharp
public int? FamilyPackageId { get; set; }
public FamilyPackage? FamilyPackage { get; set; }
```

- [ ] **Build để xác nhận không lỗi**

```bash
cd backend
dotnet build
```
Expected: `Build succeeded.`

- [ ] **Commit**

```bash
git add backend/CinemaBooking.Domain/
git commit -m "feat: add FamilyPackage entity, AgeRating enum, extend Movie and Booking"
```

---

## Task 2: DAL — EF config + DbContext + migration

**Files:**
- Create: `backend/CinemaBooking.DAL/Configurations/FamilyPackageConfiguration.cs`
- Modify: `backend/CinemaBooking.DAL/Configurations/MovieConfiguration.cs`
- Modify: `backend/CinemaBooking.DAL/Configurations/BookingConfiguration.cs`
- Modify: `backend/CinemaBooking.DAL/AppDbContext.cs`

- [ ] **Tạo `FamilyPackageConfiguration.cs`**

```csharp
using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemaBooking.DAL.Configurations;

public class FamilyPackageConfiguration : IEntityTypeConfiguration<FamilyPackage>
{
    public void Configure(EntityTypeBuilder<FamilyPackage> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Name).IsRequired().HasMaxLength(100);
        builder.Property(f => f.DiscountPct).HasColumnType("decimal(5,4)");
    }
}
```

- [ ] **Sửa `MovieConfiguration.cs` — thêm AgeRating**

Thêm vào cuối method `Configure`:
```csharp
builder.Property(m => m.AgeRating).HasConversion<string>().HasMaxLength(5);
```

- [ ] **Sửa `BookingConfiguration.cs` — thêm FK nullable**

Thêm vào cuối method `Configure`:
```csharp
builder.HasOne(b => b.FamilyPackage)
       .WithMany(f => f.Bookings)
       .HasForeignKey(b => b.FamilyPackageId)
       .OnDelete(DeleteBehavior.SetNull)
       .IsRequired(false);
```

- [ ] **Sửa `AppDbContext.cs` — thêm DbSet**

Thêm vào danh sách DbSet:
```csharp
public DbSet<FamilyPackage> FamilyPackages => Set<FamilyPackage>();
```

- [ ] **Tạo migration**

```bash
cd backend
dotnet ef migrations add AddFamilyBookingSupport \
  --project CinemaBooking.DAL \
  --startup-project CinemaBooking.API
```
Expected: `Done. To undo this action, use 'ef migrations remove'`

- [ ] **Apply migration**

```bash
dotnet ef database update \
  --project CinemaBooking.DAL \
  --startup-project CinemaBooking.API
```
Expected: `Done.`

- [ ] **Xác nhận bảng tạo thành công**

```bash
# Trong WSL2:
docker exec postgres_cinema psql -U root -d cinema -c "\d FamilyPackages"
```
Expected: bảng hiển thị các cột Id, Name, AdultCount, ChildCount, DiscountPct, IsActive.

- [ ] **Commit**

```bash
git add backend/CinemaBooking.DAL/
git commit -m "feat: EF config and migration for FamilyPackage, AgeRating, Booking FK"
```

---

## Task 3: DAL — SeatRepository

**Files:**
- Create: `backend/CinemaBooking.DAL/Repositories/Interfaces/ISeatRepository.cs`
- Create: `backend/CinemaBooking.DAL/Repositories/SeatRepository.cs`

- [ ] **Tạo `ISeatRepository.cs`**

```csharp
using CinemaBooking.Domain.Entities;

namespace CinemaBooking.DAL.Repositories.Interfaces;

public interface ISeatRepository : IRepository<Seat>
{
    Task<IEnumerable<Seat>> GetAvailableByShowtimeAsync(int showtimeId);
    Task<Hall> GetHallByShowtimeAsync(int showtimeId);
}
```

- [ ] **Tạo `SeatRepository.cs`**

```csharp
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using CinemaBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.DAL.Repositories;

public class SeatRepository(AppDbContext context) : BaseRepository<Seat>(context), ISeatRepository
{
    public async Task<IEnumerable<Seat>> GetAvailableByShowtimeAsync(int showtimeId)
    {
        var takenSeatIds = await _context.BookingSeats
            .Where(bs => bs.Booking.ShowtimeId == showtimeId
                && bs.Status != SeatStatus.Available
                && (bs.ExpiresAt == null || bs.ExpiresAt > DateTime.UtcNow))
            .Select(bs => bs.SeatId)
            .ToListAsync();

        var hallId = await _context.Showtimes
            .Where(s => s.Id == showtimeId)
            .Select(s => s.HallId)
            .FirstAsync();

        return await _context.Seats
            .Where(s => s.HallId == hallId && !takenSeatIds.Contains(s.Id))
            .OrderBy(s => s.Row).ThenBy(s => s.Column)
            .ToListAsync();
    }

    public async Task<Hall> GetHallByShowtimeAsync(int showtimeId) =>
        await _context.Showtimes
            .Where(s => s.Id == showtimeId)
            .Select(s => s.Hall)
            .FirstAsync();
}
```

- [ ] **Build**

```bash
cd backend && dotnet build
```
Expected: `Build succeeded.`

- [ ] **Commit**

```bash
git add backend/CinemaBooking.DAL/Repositories/
git commit -m "feat: add SeatRepository with available-by-showtime query"
```

---

## Task 4: Test project setup

**Files:**
- Create: `backend/CinemaBooking.Tests/CinemaBooking.Tests.csproj`

- [ ] **Tạo xUnit project**

```bash
cd backend
dotnet new xunit -n CinemaBooking.Tests -f net10.0
dotnet sln add CinemaBooking.Tests/CinemaBooking.Tests.csproj
dotnet add CinemaBooking.Tests/CinemaBooking.Tests.csproj reference CinemaBooking.BLL/CinemaBooking.BLL.csproj
dotnet add CinemaBooking.Tests/CinemaBooking.Tests.csproj reference CinemaBooking.Domain/CinemaBooking.Domain.csproj
dotnet add CinemaBooking.Tests/CinemaBooking.Tests.csproj package Moq
```

- [ ] **Xóa file mẫu**

```bash
rm backend/CinemaBooking.Tests/UnitTest1.cs
```

- [ ] **Chạy test (rỗng) để xác nhận setup**

```bash
cd backend && dotnet test
```
Expected: `No test is available` hoặc `0 tests passed`.

- [ ] **Commit**

```bash
git add backend/CinemaBooking.Tests/
git commit -m "chore: add xUnit test project"
```

---

## Task 5: BLL — SeatSuggestionService (TDD)

**Files:**
- Create: `backend/CinemaBooking.BLL/Services/Interfaces/ISeatSuggestionService.cs`
- Create: `backend/CinemaBooking.BLL/Services/SeatSuggestionService.cs`
- Create: `backend/CinemaBooking.Tests/SeatSuggestionServiceTests.cs`

- [ ] **Tạo interface và result type**

`BLL/Services/Interfaces/ISeatSuggestionService.cs`:
```csharp
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
}
```

- [ ] **Tạo stub service (để test có thể compile)**

`BLL/Services/SeatSuggestionService.cs`:
```csharp
using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories.Interfaces;

namespace CinemaBooking.BLL.Services;

public class SeatSuggestionService(
    ISeatRepository seatRepo,
    IShowtimeRepository showtimeRepo) : ISeatSuggestionService
{
    public Task<SeatSuggestionResult> SuggestAsync(int showtimeId, int seatCount)
        => throw new NotImplementedException();
}
```

- [ ] **Viết test 1 — tìm được N ghế liền nhau**

`Tests/SeatSuggestionServiceTests.cs`:
```csharp
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
                .Select(c => new Seat { Id = (r - 1) * hall.Columns + c, Row = r, Column = c, HallId = hall.Id, Type = SeatType.Standard }))
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
        // Only 2 seats available in row 4 and 2 in row 5
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
        showtimeRepo.Setup(r => r.GetAlternativesWithEnoughSeatsAsync(1, 4)).ReturnsAsync(altShowtimes);

        var service = new SeatSuggestionService(seatRepo.Object, showtimeRepo.Object);
        var result = await service.SuggestAsync(showtimeId: 1, seatCount: 4);

        Assert.Empty(result.Seats);
        Assert.True(result.IsFallback);
        Assert.Equal(2, result.AlternativeShowtimeIds.Count);
    }
}
```

- [ ] **Chạy test — xác nhận FAIL**

```bash
cd backend && dotnet test --filter "SeatSuggestionServiceTests"
```
Expected: 4 test FAIL với `NotImplementedException`.

- [ ] **Implement SeatSuggestionService**

Thay toàn bộ nội dung `BLL/Services/SeatSuggestionService.cs`:
```csharp
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
            var alts = await showtimeRepo.GetAlternativesWithEnoughSeatsAsync(showtimeId, seatCount);
            return new SeatSuggestionResult
            {
                IsFallback = true,
                FallbackMessage = "Suất chiếu này đã hết chỗ.",
                AlternativeShowtimeIds = alts.Select(s => s.Id).ToList()
            };
        }

        var byRow = available
            .GroupBy(s => s.Row)
            .ToDictionary(g => g.Key, g => g.OrderBy(s => s.Column).ToList());

        var candidates = FindContiguousGroups(byRow, seatCount);

        if (candidates.Count > 0)
        {
            var best = ScoreAndSelect(candidates, hall.Rows, hall.Columns);
            return new SeatSuggestionResult { Seats = best };
        }

        var fallback = FindFallbackGroups(byRow, seatCount);
        if (fallback is not null)
        {
            return new SeatSuggestionResult
            {
                Seats = fallback,
                IsFallback = true,
                FallbackMessage = $"Không còn {seatCount} ghế liền nhau — hệ thống đề xuất ghế ở 2 hàng kế tiếp."
            };
        }

        var alternatives = await showtimeRepo.GetAlternativesWithEnoughSeatsAsync(showtimeId, seatCount);
        return new SeatSuggestionResult
        {
            IsFallback = true,
            FallbackMessage = "Không đủ ghế liền nhau. Vui lòng chọn suất chiếu khác.",
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

    private static List<Seat> FindFallbackGroups(
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
                {
                    return [.. row1.Take(split), .. row2.Take(n - split)];
                }
            }
        }
        return null!;
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
```

- [ ] **Sửa `IShowtimeRepository.cs` — thêm method**

Thêm vào interface:
```csharp
Task<IEnumerable<Showtime>> GetAlternativesWithEnoughSeatsAsync(int showtimeId, int seatCount);
```

- [ ] **Implement trong `ShowtimeRepository.cs`**

Thêm method:
```csharp
public async Task<IEnumerable<Showtime>> GetAlternativesWithEnoughSeatsAsync(int showtimeId, int seatCount)
{
    var current = await _dbSet.FindAsync(showtimeId);
    if (current is null) return [];

    return await _dbSet
        .Where(s => s.Id != showtimeId
            && s.MovieId == current.MovieId
            && s.StartsAt > DateTime.UtcNow)
        .OrderBy(s => s.StartsAt)
        .Take(3)
        .ToListAsync();
}
```

- [ ] **Chạy test — xác nhận PASS**

```bash
cd backend && dotnet test --filter "SeatSuggestionServiceTests" -v
```
Expected: `4 passed`.

- [ ] **Commit**

```bash
git add backend/CinemaBooking.BLL/Services/ backend/CinemaBooking.DAL/Repositories/ backend/CinemaBooking.Tests/
git commit -m "feat: SeatSuggestionService with TDD — contiguous seat algorithm"
```

---

## Task 6: BLL — DTOs + FamilyPackageService

**Files:**
- Create: `backend/CinemaBooking.BLL/DTOs/FamilyPackageDto.cs`
- Create: `backend/CinemaBooking.BLL/Services/Interfaces/IFamilyPackageService.cs`
- Create: `backend/CinemaBooking.BLL/Services/FamilyPackageService.cs`
- Create: `backend/CinemaBooking.DAL/Repositories/Interfaces/IFamilyPackageRepository.cs`
- Create: `backend/CinemaBooking.DAL/Repositories/FamilyPackageRepository.cs`

- [ ] **Tạo `FamilyPackageDto.cs`**

```csharp
namespace CinemaBooking.BLL.DTOs;

public record FamilyPackageDto(int Id, string Name, int AdultCount, int ChildCount, decimal DiscountPct, bool IsActive);

public record FamilyPackagePricedDto(int Id, string Name, int AdultCount, int ChildCount, decimal TotalPrice);

public record CreateFamilyPackageDto(string Name, int AdultCount, int ChildCount, decimal DiscountPct);

public record UpdateFamilyPackageDto(string? Name, int? AdultCount, int? ChildCount, decimal? DiscountPct, bool? IsActive);

public record SeatDto(int Id, int Row, int Column, string SeatType);

public record SuggestSeatsRequestDto(int FamilyPackageId);

public record SuggestSeatsResultDto(
    IReadOnlyList<SeatDto> Seats,
    bool IsFallback,
    string? FallbackMessage,
    IReadOnlyList<int> AlternativeShowtimeIds,
    DateTime ExpiresAt);

public record CreateFamilyBookingDto(int ShowtimeId, int FamilyPackageId, IEnumerable<int> SeatIds);
```

- [ ] **Tạo `IFamilyPackageRepository.cs`**

```csharp
using CinemaBooking.Domain.Entities;

namespace CinemaBooking.DAL.Repositories.Interfaces;

public interface IFamilyPackageRepository : IRepository<FamilyPackage>
{
    Task<IEnumerable<FamilyPackage>> GetActiveAsync();
}
```

- [ ] **Tạo `FamilyPackageRepository.cs`**

```csharp
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.DAL.Repositories;

public class FamilyPackageRepository(AppDbContext context)
    : BaseRepository<FamilyPackage>(context), IFamilyPackageRepository
{
    public async Task<IEnumerable<FamilyPackage>> GetActiveAsync() =>
        await _dbSet.Where(f => f.IsActive).ToListAsync();
}
```

- [ ] **Tạo `IFamilyPackageService.cs`**

```csharp
using CinemaBooking.BLL.DTOs;

namespace CinemaBooking.BLL.Services.Interfaces;

public interface IFamilyPackageService
{
    Task<IEnumerable<FamilyPackageDto>> GetAllActiveAsync();
    Task<IEnumerable<FamilyPackagePricedDto>> GetPricedForShowtimeAsync(int showtimeId);
    Task<FamilyPackageDto> CreateAsync(CreateFamilyPackageDto dto);
    Task<FamilyPackageDto?> UpdateAsync(int id, UpdateFamilyPackageDto dto);
    Task<bool> DeactivateAsync(int id);
}
```

- [ ] **Tạo `FamilyPackageService.cs`**

```csharp
using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;

namespace CinemaBooking.BLL.Services;

public class FamilyPackageService(
    IFamilyPackageRepository packageRepo,
    IShowtimeRepository showtimeRepo) : IFamilyPackageService
{
    private const decimal ChildPriceFactor = 0.7m;

    public async Task<IEnumerable<FamilyPackageDto>> GetAllActiveAsync()
    {
        var packages = await packageRepo.GetActiveAsync();
        return packages.Select(p => new FamilyPackageDto(
            p.Id, p.Name, p.AdultCount, p.ChildCount, p.DiscountPct, p.IsActive));
    }

    public async Task<IEnumerable<FamilyPackagePricedDto>> GetPricedForShowtimeAsync(int showtimeId)
    {
        var showtime = await showtimeRepo.GetByIdAsync(showtimeId);
        if (showtime is null) return [];

        var packages = await packageRepo.GetActiveAsync();
        return packages.Select(p =>
        {
            var basePrice = showtime.Price * (p.AdultCount + p.ChildCount * ChildPriceFactor);
            var total = basePrice * (1 - p.DiscountPct);
            return new FamilyPackagePricedDto(p.Id, p.Name, p.AdultCount, p.ChildCount, total);
        });
    }

    public async Task<FamilyPackageDto> CreateAsync(CreateFamilyPackageDto dto)
    {
        var entity = new FamilyPackage
        {
            Name = dto.Name,
            AdultCount = dto.AdultCount,
            ChildCount = dto.ChildCount,
            DiscountPct = dto.DiscountPct
        };
        await packageRepo.AddAsync(entity);
        await packageRepo.SaveChangesAsync();
        return new FamilyPackageDto(entity.Id, entity.Name, entity.AdultCount, entity.ChildCount, entity.DiscountPct, entity.IsActive);
    }

    public async Task<FamilyPackageDto?> UpdateAsync(int id, UpdateFamilyPackageDto dto)
    {
        var entity = await packageRepo.GetByIdAsync(id);
        if (entity is null) return null;

        if (dto.Name is not null) entity.Name = dto.Name;
        if (dto.AdultCount.HasValue) entity.AdultCount = dto.AdultCount.Value;
        if (dto.ChildCount.HasValue) entity.ChildCount = dto.ChildCount.Value;
        if (dto.DiscountPct.HasValue) entity.DiscountPct = dto.DiscountPct.Value;
        if (dto.IsActive.HasValue) entity.IsActive = dto.IsActive.Value;

        packageRepo.Update(entity);
        await packageRepo.SaveChangesAsync();
        return new FamilyPackageDto(entity.Id, entity.Name, entity.AdultCount, entity.ChildCount, entity.DiscountPct, entity.IsActive);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var entity = await packageRepo.GetByIdAsync(id);
        if (entity is null) return false;
        entity.IsActive = false;
        packageRepo.Update(entity);
        await packageRepo.SaveChangesAsync();
        return true;
    }
}
```

- [ ] **Build**

```bash
cd backend && dotnet build
```
Expected: `Build succeeded.`

- [ ] **Commit**

```bash
git add backend/
git commit -m "feat: FamilyPackageService with pricing formula"
```

---

## Task 7: BLL — FamilyBookingService

**Files:**
- Create: `backend/CinemaBooking.BLL/Services/Interfaces/IFamilyBookingService.cs`
- Create: `backend/CinemaBooking.BLL/Services/FamilyBookingService.cs`

- [ ] **Tạo `IFamilyBookingService.cs`**

```csharp
using CinemaBooking.BLL.DTOs;

namespace CinemaBooking.BLL.Services.Interfaces;

public interface IFamilyBookingService
{
    Task<SuggestSeatsResultDto> SuggestSeatsAsync(int showtimeId, int familyPackageId);
    Task<BookingDto> CreateFamilyBookingAsync(int userId, CreateFamilyBookingDto dto);
}
```

- [ ] **Tạo `FamilyBookingService.cs`**

```csharp
using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using CinemaBooking.Domain.Enums;

namespace CinemaBooking.BLL.Services;

public class FamilyBookingService(
    ISeatSuggestionService suggestionService,
    IFamilyPackageRepository packageRepo,
    IBookingRepository bookingRepo,
    ISeatRepository seatRepo) : IFamilyBookingService
{
    private static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(10);

    public async Task<SuggestSeatsResultDto> SuggestSeatsAsync(int showtimeId, int familyPackageId)
    {
        var package = await packageRepo.GetByIdAsync(familyPackageId)
            ?? throw new KeyNotFoundException($"FamilyPackage {familyPackageId} not found.");

        var seatCount = package.AdultCount + package.ChildCount;
        var result = await suggestionService.SuggestAsync(showtimeId, seatCount);

        if (result.Seats.Count > 0)
        {
            var expiresAt = DateTime.UtcNow.Add(LockDuration);
            var tempBooking = new Booking
            {
                UserId = 0,
                ShowtimeId = showtimeId,
                FamilyPackageId = familyPackageId,
                TicketCode = $"TEMP-{Guid.NewGuid():N}",
                BookingSeats = result.Seats.Select(s => new BookingSeat
                {
                    SeatId = s.Id,
                    Status = SeatStatus.Pending,
                    ExpiresAt = expiresAt
                }).ToList()
            };
            await bookingRepo.AddAsync(tempBooking);
            await bookingRepo.SaveChangesAsync();

            return new SuggestSeatsResultDto(
                result.Seats.Select(s => new SeatDto(s.Id, s.Row, s.Column, s.Type.ToString())).ToList(),
                result.IsFallback,
                result.FallbackMessage,
                result.AlternativeShowtimeIds,
                expiresAt);
        }

        return new SuggestSeatsResultDto([], result.IsFallback, result.FallbackMessage,
            result.AlternativeShowtimeIds, DateTime.UtcNow);
    }

    public async Task<BookingDto> CreateFamilyBookingAsync(int userId, CreateFamilyBookingDto dto)
    {
        // Xóa temp booking nếu có (UserId = 0, cùng showtime + seats)
        var tempBookings = await bookingRepo.FindAsync(b =>
            b.UserId == 0 && b.ShowtimeId == dto.ShowtimeId
            && b.BookingSeats.Any(bs => dto.SeatIds.Contains(bs.SeatId)));
        foreach (var temp in tempBookings)
            bookingRepo.Remove(temp);

        var ticketCode = $"FAM-{Guid.NewGuid():N[..8].ToUpper()}";
        var booking = new Booking
        {
            UserId = userId,
            ShowtimeId = dto.ShowtimeId,
            FamilyPackageId = dto.FamilyPackageId,
            TicketCode = ticketCode,
            BookingSeats = dto.SeatIds.Select(seatId => new BookingSeat
            {
                SeatId = seatId,
                Status = SeatStatus.Confirmed
            }).ToList()
        };

        await bookingRepo.AddAsync(booking);
        await bookingRepo.SaveChangesAsync();

        var full = await bookingRepo.GetWithSeatsAsync(booking.Id);
        return new BookingDto(
            full!.Id,
            full.TicketCode,
            full.ShowtimeId,
            full.Showtime?.Movie?.Title ?? string.Empty,
            full.Showtime?.StartsAt ?? DateTime.MinValue,
            full.BookingSeats.Select(bs => new BookingSeatDto(
                bs.SeatId, bs.Seat?.Row ?? 0, bs.Seat?.Column ?? 0,
                bs.Seat?.Type.ToString() ?? string.Empty,
                bs.Status.ToString())));
    }
}
```

- [ ] **Build**

```bash
cd backend && dotnet build
```
Expected: `Build succeeded.`

- [ ] **Commit**

```bash
git add backend/CinemaBooking.BLL/Services/
git commit -m "feat: FamilyBookingService — suggest + lock seats, create confirmed booking"
```

---

## Task 8: API — SeatExpiryService + DI + Controllers

**Files:**
- Create: `backend/CinemaBooking.API/BackgroundServices/SeatExpiryService.cs`
- Create: `backend/CinemaBooking.API/Controllers/FamilyPackagesController.cs`
- Create: `backend/CinemaBooking.API/Controllers/FamilyBookingController.cs`
- Modify: `backend/CinemaBooking.API/Program.cs`

- [ ] **Tạo thư mục và `SeatExpiryService.cs`**

```bash
mkdir backend/CinemaBooking.API/BackgroundServices
```

```csharp
using CinemaBooking.DAL;
using CinemaBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.API.BackgroundServices;

public class SeatExpiryService(IServiceScopeFactory scopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            using var scope = scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var expired = await context.BookingSeats
                .Include(bs => bs.Booking)
                .Where(bs => bs.Status == SeatStatus.Pending
                    && bs.ExpiresAt != null
                    && bs.ExpiresAt < DateTime.UtcNow)
                .ToListAsync(stoppingToken);

            if (expired.Count == 0) continue;

            context.BookingSeats.RemoveRange(expired);

            var bookingIds = expired.Select(bs => bs.BookingId).Distinct();
            var emptyBookings = await context.Bookings
                .Where(b => bookingIds.Contains(b.Id) && !b.BookingSeats.Any())
                .ToListAsync(stoppingToken);
            context.Bookings.RemoveRange(emptyBookings);

            await context.SaveChangesAsync(stoppingToken);
        }
    }
}
```

- [ ] **Tạo `FamilyPackagesController.cs`**

```csharp
using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.API.Controllers;

[ApiController]
[Route("api/family-packages")]
public class FamilyPackagesController(IFamilyPackageService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await service.GetAllActiveAsync());

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateFamilyPackageDto dto) =>
        Ok(await service.CreateAsync(dto));

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, UpdateFamilyPackageDto dto)
    {
        var result = await service.UpdateAsync(id, dto);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var ok = await service.DeactivateAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
```

- [ ] **Tạo `FamilyBookingController.cs`**

```csharp
using System.Security.Claims;
using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.API.Controllers;

[ApiController]
public class FamilyBookingController(
    IFamilyPackageService packageService,
    IFamilyBookingService bookingService,
    IMovieService movieService) : ControllerBase
{
    [HttpGet("api/movies/family-friendly")]
    public async Task<IActionResult> GetFamilyFriendlyMovies()
    {
        var all = await movieService.GetAllAsync();
        var familyRatings = new[] { "P", "K", "T13" };
        var sorted = all
            .OrderByDescending(m => familyRatings.Contains(m.AgeRating))
            .ThenBy(m => m.Title);
        return Ok(sorted);
    }

    [HttpGet("api/showtimes/{id}/family-packages")]
    public async Task<IActionResult> GetPricedPackages(int id) =>
        Ok(await packageService.GetPricedForShowtimeAsync(id));

    [HttpPost("api/showtimes/{id}/seats/suggest")]
    public async Task<IActionResult> SuggestSeats(int id, SuggestSeatsRequestDto dto) =>
        Ok(await bookingService.SuggestSeatsAsync(id, dto.FamilyPackageId));

    [HttpPost("api/bookings/family")]
    [Authorize]
    public async Task<IActionResult> CreateFamilyBooking(CreateFamilyBookingDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await bookingService.CreateFamilyBookingAsync(userId, dto);
        return Ok(result);
    }
}
```

- [ ] **Sửa `Program.cs` — đăng ký services mới**

Tìm dòng `builder.Services.AddAuthorization();` và thêm sau đó:
```csharp
// DAL repositories
builder.Services.AddScoped<IFamilyPackageRepository, FamilyPackageRepository>();
builder.Services.AddScoped<ISeatRepository, SeatRepository>();

// BLL services
builder.Services.AddScoped<ISeatSuggestionService, SeatSuggestionService>();
builder.Services.AddScoped<IFamilyPackageService, FamilyPackageService>();
builder.Services.AddScoped<IFamilyBookingService, FamilyBookingService>();

// Background service
builder.Services.AddHostedService<SeatExpiryService>();
```

Thêm các using cần thiết ở đầu file `Program.cs`:
```csharp
using CinemaBooking.API.BackgroundServices;
using CinemaBooking.BLL.Services;
using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories;
using CinemaBooking.DAL.Repositories.Interfaces;
```

- [ ] **Sửa `MovieDto.cs` — thêm AgeRating**

```csharp
public record MovieDto(int Id, string Title, string Genre, int Duration, string PosterUrl, double Rating, string AgeRating);
```

- [ ] **Sửa `MovieProfile.cs` — map AgeRating**

Trong `MovieProfile`, sửa `CreateMap<Movie, MovieDto>()`:
```csharp
CreateMap<Movie, MovieDto>()
    .ForMember(d => d.AgeRating, o => o.MapFrom(s => s.AgeRating.ToString()));
```

- [ ] **Build và chạy**

```bash
cd backend
dotnet build
dotnet run --project CinemaBooking.API
```
Expected: `Now listening on: http://localhost:5282`

- [ ] **Smoke test endpoints**

```bash
curl -s http://localhost:5282/api/family-packages
# Expected: [] (trống vì chưa có data)

curl -s http://localhost:5282/api/movies/family-friendly
# Expected: [] hoặc danh sách phim
```

- [ ] **Commit**

```bash
git add backend/CinemaBooking.API/
git commit -m "feat: SeatExpiryService, FamilyPackagesController, FamilyBookingController, DI wiring"
```

---

## Task 9: Frontend setup

- [ ] **Khởi tạo Vite + React + TypeScript**

```bash
cd frontend
bun create vite . --template react-ts
bun install
```

- [ ] **Cài thêm dependencies**

```bash
bun add axios react-router-dom zustand
bun add -d @types/react-router-dom
```

- [ ] **Cài Tailwind CSS v4**

```bash
bun add tailwindcss @tailwindcss/vite
```

Sửa `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Sửa `src/index.css` — thay toàn bộ nội dung:
```css
@import "tailwindcss";
```

- [ ] **Tạo cấu trúc thư mục**

```bash
mkdir -p src/api
mkdir -p src/features/family-booking/pages
mkdir -p src/features/family-booking/components
mkdir -p src/features/family-booking/hooks
```

- [ ] **Chạy dev server**

```bash
bun run dev
```
Expected: `Local: http://localhost:5173`

- [ ] **Commit**

```bash
git add frontend/
git commit -m "chore: init Vite React TS frontend with Tailwind v4"
```

---

## Task 10: Frontend — API client

**Files:**
- Create: `frontend/src/api/familyBooking.ts`

- [ ] **Tạo `familyBooking.ts`**

```typescript
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface MovieDto {
  id: number
  title: string
  genre: string
  duration: number
  posterUrl: string
  rating: number
  ageRating: string
}

export interface FamilyPackagePricedDto {
  id: number
  name: string
  adultCount: number
  childCount: number
  totalPrice: number
}

export interface SeatDto {
  id: number
  row: number
  column: number
  seatType: string
}

export interface SuggestSeatsResult {
  seats: SeatDto[]
  isFallback: boolean
  fallbackMessage: string | null
  alternativeShowtimeIds: number[]
  expiresAt: string
}

export interface CreateFamilyBookingDto {
  showtimeId: number
  familyPackageId: number
  seatIds: number[]
}

export interface BookingDto {
  id: number
  ticketCode: string
  showtimeId: number
  movieTitle: string
  startsAt: string
  seats: { seatId: number; row: number; column: number; seatType: string; status: string }[]
}

export const getFamilyFriendlyMovies = () =>
  api.get<MovieDto[]>('/api/movies/family-friendly').then(r => r.data)

export const getFamilyPackagesForShowtime = (showtimeId: number) =>
  api.get<FamilyPackagePricedDto[]>(`/api/showtimes/${showtimeId}/family-packages`).then(r => r.data)

export const suggestSeats = (showtimeId: number, familyPackageId: number) =>
  api.post<SuggestSeatsResult>(`/api/showtimes/${showtimeId}/seats/suggest`, { familyPackageId }).then(r => r.data)

export const createFamilyBooking = (dto: CreateFamilyBookingDto) =>
  api.post<BookingDto>('/api/bookings/family', dto).then(r => r.data)
```

- [ ] **Tạo `.env.local`**

```bash
echo "VITE_API_BASE_URL=http://localhost:5282" > frontend/.env.local
```

- [ ] **Commit**

```bash
git add frontend/src/api/
git commit -m "feat: family booking API client functions"
```

---

## Task 11: Frontend — Components

**Files:**
- Create: `frontend/src/features/family-booking/components/AgeRatingBadge.tsx`
- Create: `frontend/src/features/family-booking/components/FamilyPackageCard.tsx`
- Create: `frontend/src/features/family-booking/components/SeatMapPreview.tsx`
- Create: `frontend/src/features/family-booking/components/FallbackShowtimeSuggest.tsx`

- [ ] **`AgeRatingBadge.tsx`**

```tsx
const colors: Record<string, string> = {
  P: 'bg-green-100 text-green-800',
  K: 'bg-blue-100 text-blue-800',
  T13: 'bg-yellow-100 text-yellow-800',
  T16: 'bg-orange-100 text-orange-800',
  T18: 'bg-red-100 text-red-800',
}

export function AgeRatingBadge({ rating }: { rating: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-sm font-bold ${colors[rating] ?? 'bg-gray-100 text-gray-700'}`}>
      {rating}
    </span>
  )
}
```

- [ ] **`FamilyPackageCard.tsx`**

```tsx
import type { FamilyPackagePricedDto } from '../../../api/familyBooking'

interface Props {
  pkg: FamilyPackagePricedDto
  selected: boolean
  onSelect: () => void
}

export function FamilyPackageCard({ pkg, selected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      style={{ minHeight: 56 }}
      className={`w-full rounded-xl border-2 p-5 text-left transition-all
        ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
    >
      <p className="text-xl font-bold text-gray-900">{pkg.name}</p>
      <p className="mt-1 text-base text-gray-500">
        {pkg.adultCount} người lớn + {pkg.childCount} trẻ em
      </p>
      <p className="mt-2 text-2xl font-extrabold text-blue-700">
        {pkg.totalPrice.toLocaleString('vi-VN')}đ
      </p>
    </button>
  )
}
```

- [ ] **`SeatMapPreview.tsx`**

```tsx
import type { SeatDto } from '../../../api/familyBooking'

interface Props {
  rows: number
  columns: number
  suggestedSeats: SeatDto[]
}

export function SeatMapPreview({ rows, columns, suggestedSeats }: Props) {
  const suggestedIds = new Set(suggestedSeats.map(s => s.id))

  return (
    <div className="overflow-x-auto">
      <div className="mb-3 text-center text-sm text-gray-500 tracking-widest">MÀN HÌNH</div>
      <div className="h-1 rounded bg-gray-300 mb-6 mx-8" />
      <div className="flex flex-col gap-1 items-center">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex gap-1">
            {Array.from({ length: columns }, (_, c) => {
              const seatId = suggestedSeats.find(s => s.row === r + 1 && s.column === c + 1)?.id
              const isSelected = suggestedIds.has(seatId ?? -1)
              return (
                <div
                  key={c}
                  className={`w-6 h-6 rounded-t-md text-[9px] flex items-center justify-center
                    ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **`FallbackShowtimeSuggest.tsx`**

```tsx
interface Props {
  message: string
  alternativeShowtimeIds: number[]
  onSelectShowtime: (id: number) => void
}

export function FallbackShowtimeSuggest({ message, alternativeShowtimeIds, onSelectShowtime }: Props) {
  if (!message) return null
  return (
    <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
      <p className="text-yellow-800 font-medium">{message}</p>
      {alternativeShowtimeIds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {alternativeShowtimeIds.map(id => (
            <button
              key={id}
              onClick={() => onSelectShowtime(id)}
              className="px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-900 text-sm hover:bg-yellow-200"
            >
              Suất #{id}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add frontend/src/features/family-booking/components/
git commit -m "feat: AgeRatingBadge, FamilyPackageCard, SeatMapPreview, FallbackShowtimeSuggest components"
```

---

## Task 12: Frontend — Hooks

**Files:**
- Create: `frontend/src/features/family-booking/hooks/useFamilyPackages.ts`
- Create: `frontend/src/features/family-booking/hooks/useSuggestSeats.ts`

- [ ] **`useFamilyPackages.ts`**

```typescript
import { useEffect, useState } from 'react'
import { getFamilyPackagesForShowtime, type FamilyPackagePricedDto } from '../../../api/familyBooking'

export function useFamilyPackages(showtimeId: number | null) {
  const [packages, setPackages] = useState<FamilyPackagePricedDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!showtimeId) return
    setLoading(true)
    getFamilyPackagesForShowtime(showtimeId)
      .then(setPackages)
      .catch(() => setError('Không thể tải danh sách gói.'))
      .finally(() => setLoading(false))
  }, [showtimeId])

  return { packages, loading, error }
}
```

- [ ] **`useSuggestSeats.ts`**

```typescript
import { useCallback, useEffect, useRef, useState } from 'react'
import { suggestSeats, type SuggestSeatsResult } from '../../../api/familyBooking'

export function useSuggestSeats(showtimeId: number, familyPackageId: number) {
  const [result, setResult] = useState<SuggestSeatsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [expired, setExpired] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const suggest = useCallback(async () => {
    setLoading(true)
    try {
      const data = await suggestSeats(showtimeId, familyPackageId)
      setResult(data)
      setExpired(false)

      const totalSeconds = Math.floor(
        (new Date(data.expiresAt).getTime() - Date.now()) / 1000
      )
      setSecondsLeft(totalSeconds)

      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(timerRef.current!)
            setExpired(true)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } finally {
      setLoading(false)
    }
  }, [showtimeId, familyPackageId])

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const countdownLabel = expired
    ? 'Phiên đặt vé đã hết hạn, vui lòng thử lại'
    : `Ghế được giữ trong ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`

  return { result, loading, suggest, countdownLabel, expired }
}
```

- [ ] **Commit**

```bash
git add frontend/src/features/family-booking/hooks/
git commit -m "feat: useFamilyPackages and useSuggestSeats hooks"
```

---

## Task 13: Frontend — Pages + Routes

**Files:**
- Create: `frontend/src/features/family-booking/pages/FamilyMovieListPage.tsx`
- Create: `frontend/src/features/family-booking/pages/FamilyPackagePickerPage.tsx`
- Create: `frontend/src/features/family-booking/pages/FamilyConfirmPage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **`FamilyMovieListPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFamilyFriendlyMovies, type MovieDto } from '../../../api/familyBooking'
import { AgeRatingBadge } from '../components/AgeRatingBadge'

export function FamilyMovieListPage() {
  const [movies, setMovies] = useState<MovieDto[]>([])
  const navigate = useNavigate()

  useEffect(() => { getFamilyFriendlyMovies().then(setMovies) }, [])

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Chọn phim cho gia đình</h1>
      <div className="flex flex-col gap-4">
        {movies.map(m => (
          <button
            key={m.id}
            onClick={() => navigate(`/family-booking/packages?movieId=${m.id}`)}
            className="flex gap-4 rounded-xl border border-gray-200 p-4 text-left hover:border-blue-400"
          >
            <img src={m.posterUrl} alt={m.title} className="w-20 h-28 rounded object-cover bg-gray-100" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AgeRatingBadge rating={m.ageRating} />
              </div>
              <h2 className="text-xl font-semibold">{m.title}</h2>
              <p className="text-gray-500 text-sm mt-1">{m.genre} · {m.duration} phút</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **`FamilyPackagePickerPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FamilyPackageCard } from '../components/FamilyPackageCard'
import { useFamilyPackages } from '../hooks/useFamilyPackages'

export function FamilyPackagePickerPage() {
  // TODO: replace hardcoded showtimeId with showtime selector
  const [searchParams] = useSearchParams()
  const movieId = Number(searchParams.get('movieId'))
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const showtimeId = 1 // placeholder — bước tiếp theo sẽ thêm showtime picker
  const { packages, loading } = useFamilyPackages(showtimeId)
  const navigate = useNavigate()

  if (loading) return <p className="p-4">Đang tải...</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Chọn gói gia đình</h1>
      <div className="flex flex-col gap-4">
        {packages.map(pkg => (
          <FamilyPackageCard
            key={pkg.id}
            pkg={pkg}
            selected={selectedPackageId === pkg.id}
            onSelect={() => setSelectedPackageId(pkg.id)}
          />
        ))}
      </div>
      <button
        disabled={!selectedPackageId}
        onClick={() => navigate(`/family-booking/confirm?showtimeId=${showtimeId}&packageId=${selectedPackageId}`)}
        className="mt-6 w-full py-4 rounded-xl bg-blue-600 text-white text-xl font-bold disabled:opacity-40"
      >
        Tiếp tục
      </button>
    </div>
  )
}
```

- [ ] **`FamilyConfirmPage.tsx`**

```tsx
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createFamilyBooking } from '../../../api/familyBooking'
import { SeatMapPreview } from '../components/SeatMapPreview'
import { FallbackShowtimeSuggest } from '../components/FallbackShowtimeSuggest'
import { useSuggestSeats } from '../hooks/useSuggestSeats'

export function FamilyConfirmPage() {
  const [params] = useSearchParams()
  const showtimeId = Number(params.get('showtimeId'))
  const packageId = Number(params.get('packageId'))
  const navigate = useNavigate()

  const { result, loading, suggest, countdownLabel, expired } = useSuggestSeats(showtimeId, packageId)

  useEffect(() => { suggest() }, [suggest])

  const handleConfirm = async () => {
    if (!result || result.seats.length === 0) return
    await createFamilyBooking({
      showtimeId,
      familyPackageId: packageId,
      seatIds: result.seats.map(s => s.id),
    })
    navigate('/booking-success')
  }

  if (loading) return <p className="p-4 text-lg">Đang tìm ghế tốt nhất cho gia đình...</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Xác nhận ghế</h1>

      {result && (
        <>
          {result.isFallback && (
            <FallbackShowtimeSuggest
              message={result.fallbackMessage ?? ''}
              alternativeShowtimeIds={result.alternativeShowtimeIds}
              onSelectShowtime={id => navigate(`/family-booking/confirm?showtimeId=${id}&packageId=${packageId}`)}
            />
          )}

          {result.seats.length > 0 && (
            <>
              <SeatMapPreview rows={10} columns={10} suggestedSeats={result.seats} />
              <p className={`mt-4 text-center font-medium ${expired ? 'text-red-600' : 'text-gray-600'}`}>
                {countdownLabel}
              </p>
              <button
                disabled={expired}
                onClick={handleConfirm}
                className="mt-6 w-full py-4 rounded-xl bg-green-600 text-white text-xl font-bold disabled:opacity-40"
              >
                Xác nhận & Thanh toán
              </button>
              <button
                onClick={suggest}
                className="mt-3 w-full py-3 rounded-xl border border-gray-300 text-gray-700"
              >
                Đổi vị trí khác
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Sửa `App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FamilyMovieListPage } from './features/family-booking/pages/FamilyMovieListPage'
import { FamilyPackagePickerPage } from './features/family-booking/pages/FamilyPackagePickerPage'
import { FamilyConfirmPage } from './features/family-booking/pages/FamilyConfirmPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col items-center justify-center min-h-screen gap-6">
            <h1 className="text-4xl font-bold">Cinema Booking</h1>
            <a href="/family-booking/movies"
               className="px-8 py-4 bg-blue-600 text-white text-xl rounded-xl hover:bg-blue-700">
              Đặt vé gia đình
            </a>
          </div>
        } />
        <Route path="/family-booking/movies" element={<FamilyMovieListPage />} />
        <Route path="/family-booking/packages" element={<FamilyPackagePickerPage />} />
        <Route path="/family-booking/confirm" element={<FamilyConfirmPage />} />
        <Route path="/booking-success" element={
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-4xl font-bold text-green-600">Đặt vé thành công!</h1>
            <a href="/" className="text-blue-600 underline">Về trang chủ</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Chạy frontend và kiểm tra luồng**

```bash
cd frontend && bun run dev
```
Mở `http://localhost:5173` → bấm "Đặt vé gia đình" → kiểm tra trang danh sách phim load được.

- [ ] **Commit**

```bash
git add frontend/src/
git commit -m "feat: family booking pages and routing — FamilyMovieList, PackagePicker, Confirm"
```

---

## Checklist Spec Coverage

| Yêu cầu spec | Task |
|---|---|
| Entity FamilyPackage | Task 1 |
| AgeRating enum trên Movie | Task 1 |
| FamilyPackageId nullable trên Booking | Task 1 |
| EF config + migration | Task 2 |
| Lọc ghế Available theo suất chiếu | Task 3 |
| Thuật toán chọn N ghế liền nhau | Task 5 |
| Chấm điểm hàng/cột giữa | Task 5 |
| Fallback 2 hàng khi không đủ 1 hàng | Task 5 |
| Gợi ý suất chiếu thay thế | Task 5 |
| Lock Pending 10 phút | Task 7 |
| SeatExpiryService chạy mỗi 1 phút | Task 8 |
| 4 endpoints Admin (CRUD gói) | Task 8 |
| GET movies/family-friendly | Task 8 |
| GET showtimes/{id}/family-packages | Task 8 |
| POST seats/suggest | Task 8 |
| POST bookings/family | Task 8 |
| FamilyPackageCard tap target ≥ 56px | Task 11 |
| Countdown hiển thị + toast hết hạn | Task 12 |
| 3 pages + routing | Task 13 |
