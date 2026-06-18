using CinemaBooking.BLL.DTOs;

namespace CinemaBooking.BLL.Services.Interfaces;

public interface IBookingService
{
    Task<IEnumerable<BookingDto>> GetUserBookingsAsync(int userId);
    Task<BookingDto?> GetByIdAsync(int userId, int id);
    Task<BookingDto> CreateAsync(int userId, CreateBookingDto dto);
    Task<BookingDto?> GetByTicketCodeAsync(string ticketCode);
    Task<bool> CancelAsync(int userId, int bookingId);
    Task<BookingDto?> CheckInAsync(int bookingId);
}
