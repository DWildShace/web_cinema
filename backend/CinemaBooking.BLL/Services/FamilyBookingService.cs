using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using CinemaBooking.Domain.Enums;

namespace CinemaBooking.BLL.Services;

public class FamilyBookingService(
    ISeatSuggestionService suggestionService,
    IFamilyPackageRepository packageRepo,
    IBookingRepository bookingRepo) : IFamilyBookingService
{
    private static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(10);

    public async Task<SuggestSeatsResultDto> SuggestSeatsAsync(int showtimeId, int familyPackageId, int userId)
    {
        var package = await packageRepo.GetByIdAsync(familyPackageId)
            ?? throw new KeyNotFoundException($"FamilyPackage {familyPackageId} not found.");

        var seatCount = package.AdultCount + package.ChildCount;
        var result = await suggestionService.SuggestAsync(showtimeId, seatCount);

        if (result.Seats.Count > 0)
        {
            var expiresAt = DateTime.UtcNow.Add(LockDuration);

            // Release any previous pending suggestion this user has for same showtime+package
            var previous = await bookingRepo.GetActivePendingAsync(userId, showtimeId, familyPackageId);
            foreach (var old in previous)
                bookingRepo.Remove(old);

            var tempBooking = new Booking
            {
                UserId = userId,
                ShowtimeId = showtimeId,
                FamilyPackageId = familyPackageId,
                TicketCode = "TEMP-" + Guid.NewGuid().ToString("N"),
                BookingSeats = result.Seats.Select(s => new BookingSeat
                {
                    SeatId = s.Id,
                    ShowtimeId = showtimeId,
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
                expiresAt,
                result.HallRows,
                result.HallColumns);
        }

        return new SuggestSeatsResultDto([], result.IsFallback, result.FallbackMessage,
            result.AlternativeShowtimeIds, DateTime.UtcNow, 0, 0);
    }

    public async Task<BookingDto> CreateFamilyBookingAsync(int userId, CreateFamilyBookingDto dto)
    {
        var seatIds = dto.SeatIds.ToHashSet();

        var package = await packageRepo.GetByIdAsync(dto.FamilyPackageId)
            ?? throw new KeyNotFoundException($"FamilyPackage {dto.FamilyPackageId} not found.");

        if (seatIds.Count != package.AdultCount + package.ChildCount)
            throw new InvalidOperationException("Seat count does not match package.");

        await using var tx = await bookingRepo.BeginTransactionAsync();
        try
        {
            // Verify caller owns a pending suggestion covering exactly these seats
            var pending = await bookingRepo.GetActivePendingAsync(userId, dto.ShowtimeId, dto.FamilyPackageId);
            var tempBooking = pending.FirstOrDefault(b =>
                b.BookingSeats.Select(bs => bs.SeatId).ToHashSet().SetEquals(seatIds));

            if (tempBooking is null)
                throw new UnauthorizedAccessException(
                    "No valid pending suggestion found for these seats. Request a new suggestion.");

            // Runtime double-booking guard (belt-and-suspenders; DB unique index is the real fence)
            if (await bookingRepo.AnyConfirmedForSeatsAsync(dto.ShowtimeId, seatIds))
                throw new InvalidOperationException("Ghế vừa được đặt bởi người khác. Vui lòng thử lại.");

            bookingRepo.Remove(tempBooking);

            var ticketCode = "FAM-" + Guid.NewGuid().ToString("N")[..8].ToUpper();
            var booking = new Booking
            {
                UserId = userId,
                ShowtimeId = dto.ShowtimeId,
                FamilyPackageId = dto.FamilyPackageId,
                TicketCode = ticketCode,
                BookingSeats = seatIds.Select(seatId => new BookingSeat
                {
                    SeatId = seatId,
                    ShowtimeId = dto.ShowtimeId,
                    Status = SeatStatus.Confirmed
                }).ToList()
            };

            await bookingRepo.AddAsync(booking);
            await bookingRepo.SaveChangesAsync(); // throws InvalidOperationException on unique violation
            await tx.CommitAsync();

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
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}
