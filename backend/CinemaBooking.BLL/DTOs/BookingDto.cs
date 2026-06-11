namespace CinemaBooking.BLL.DTOs;

public record BookingDto(int Id, string TicketCode, int ShowtimeId, string MovieTitle, DateTime StartsAt, IEnumerable<BookingSeatDto> Seats);

public record BookingSeatDto(int SeatId, int Row, int Column, string SeatType, string Status);

public record CreateBookingDto(int ShowtimeId, IEnumerable<int> SeatIds);
