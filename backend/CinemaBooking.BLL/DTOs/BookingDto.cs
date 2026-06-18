namespace CinemaBooking.BLL.DTOs;

public record BookingDto(
    int Id,
    string TicketCode,
    int ShowtimeId,
    string MovieTitle,
    string HallName,
    string CinemaName,
    DateTime StartsAt,
    decimal Price,
    string Status,
    IEnumerable<BookingSeatDto> Seats);

public record BookingSeatDto(int SeatId, int Row, int Column, string SeatType, string Status);

public record CreateBookingDto(int ShowtimeId, IEnumerable<int> SeatIds);
