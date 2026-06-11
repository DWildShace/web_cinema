using System.ComponentModel.DataAnnotations;

namespace CinemaBooking.BLL.DTOs;

public record FamilyPackageDto(int Id, string Name, int AdultCount, int ChildCount, decimal DiscountPct, bool IsActive);

public record FamilyPackagePricedDto(int Id, string Name, int AdultCount, int ChildCount, decimal TotalPrice);

public record CreateFamilyPackageDto(
    string Name,
    int AdultCount,
    int ChildCount,
    [property: Range(0.0, 1.0)] decimal DiscountPct);

public record UpdateFamilyPackageDto(
    string? Name,
    int? AdultCount,
    int? ChildCount,
    [property: Range(0.0, 1.0)] decimal? DiscountPct,
    bool? IsActive);

public record SeatDto(int Id, int Row, int Column, string SeatType);

public record SuggestSeatsRequestDto(int FamilyPackageId);

public record SuggestSeatsResultDto(
    IReadOnlyList<SeatDto> Seats,
    bool IsFallback,
    string? FallbackMessage,
    IReadOnlyList<int> AlternativeShowtimeIds,
    DateTime ExpiresAt,
    int HallRows,
    int HallColumns);

public record CreateFamilyBookingDto(int ShowtimeId, int FamilyPackageId, IEnumerable<int> SeatIds);
