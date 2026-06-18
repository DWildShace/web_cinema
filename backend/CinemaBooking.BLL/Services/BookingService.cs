using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using CinemaBooking.Domain.Enums;

namespace CinemaBooking.BLL.Services;

public class BookingService(
    IBookingRepository bookingRepo,
    ISeatRepository seatRepo,
    IShowtimeRepository showtimeRepo) : IBookingService
{
    public async Task<IEnumerable<BookingDto>> GetUserBookingsAsync(int userId)
    {
        var bookings = await bookingRepo.GetByUserIdAsync(userId);
        return bookings.Select(ToDto);
    }

    public async Task<BookingDto?> GetByIdAsync(int userId, int id)
    {
        var booking = await bookingRepo.GetWithSeatsAsync(id);
        if (booking is null || booking.UserId != userId) return null;
        return ToDto(booking);
    }

    public async Task<BookingDto> CreateAsync(int userId, CreateBookingDto dto)
    {
        var showtime = await showtimeRepo.GetWithDetailsAsync(dto.ShowtimeId)
            ?? throw new KeyNotFoundException("Suất chiếu không tồn tại.");

        var seatIds = dto.SeatIds.ToList();
        if (seatIds.Count == 0)
            throw new InvalidOperationException("Phải chọn ít nhất một ghế.");

        var available = await seatRepo.GetAvailableByShowtimeAsync(dto.ShowtimeId);
        var availableIds = available.Select(s => s.Id).ToHashSet();

        if (seatIds.Any(id => !availableIds.Contains(id)))
            throw new InvalidOperationException("Một hoặc nhiều ghế không còn trống.");

        var booking = new Booking
        {
            UserId = userId,
            ShowtimeId = dto.ShowtimeId,
            TicketCode = Guid.NewGuid().ToString("N")[..12].ToUpper(),
            Status = BookingStatus.Confirmed,
            BookingSeats = seatIds.Select(seatId => new BookingSeat
            {
                SeatId = seatId,
                ShowtimeId = dto.ShowtimeId,
                Status = SeatStatus.Confirmed
            }).ToList()
        };

        await bookingRepo.AddAsync(booking);
        await bookingRepo.SaveChangesAsync();

        var full = await bookingRepo.GetWithSeatsAsync(booking.Id);
        return ToDto(full!);
    }

    public async Task<BookingDto?> GetByTicketCodeAsync(string ticketCode)
    {
        var booking = await bookingRepo.GetByTicketCodeAsync(ticketCode);
        if (booking is null) return null;
        var full = await bookingRepo.GetWithSeatsAsync(booking.Id);
        return full is null ? null : ToDto(full);
    }

    public async Task<bool> CancelAsync(int userId, int bookingId)
    {
        var booking = await bookingRepo.GetWithSeatsAsync(bookingId);
        if (booking is null || booking.UserId != userId) return false;

        if (booking.Status == BookingStatus.CheckedIn)
            throw new InvalidOperationException("Vé đã được check-in, không thể huỷ.");

        if (booking.Status == BookingStatus.Cancelled)
            throw new InvalidOperationException("Vé đã bị huỷ trước đó.");

        booking.Status = BookingStatus.Cancelled;
        await bookingRepo.SaveChangesAsync();
        return true;
    }

    public async Task<BookingDto?> CheckInAsync(int bookingId)
    {
        var booking = await bookingRepo.GetWithSeatsAsync(bookingId);
        if (booking is null) return null;

        if (booking.Status == BookingStatus.Cancelled)
            throw new InvalidOperationException("Vé đã bị huỷ.");

        if (booking.Status == BookingStatus.CheckedIn)
            throw new InvalidOperationException("Vé đã được check-in rồi.");

        booking.Status = BookingStatus.CheckedIn;
        await bookingRepo.SaveChangesAsync();
        return ToDto(booking);
    }

    private static BookingDto ToDto(Booking b) => new(
        b.Id,
        b.TicketCode,
        b.ShowtimeId,
        b.Showtime?.Movie?.Title ?? string.Empty,
        b.Showtime?.Hall?.Name ?? string.Empty,
        b.Showtime?.Hall?.Cinema?.Name ?? string.Empty,
        b.Showtime?.StartsAt ?? default,
        b.Showtime?.Price ?? 0,
        b.Status.ToString(),
        b.BookingSeats.Select(bs => new BookingSeatDto(
            bs.SeatId,
            bs.Seat?.Row ?? 0,
            bs.Seat?.Column ?? 0,
            bs.Seat?.Type.ToString() ?? string.Empty,
            bs.Status.ToString()
        ))
    );
}
