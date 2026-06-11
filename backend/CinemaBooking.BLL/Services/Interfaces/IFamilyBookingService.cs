using CinemaBooking.BLL.DTOs;

namespace CinemaBooking.BLL.Services.Interfaces;

public interface IFamilyBookingService
{
    Task<SuggestSeatsResultDto> SuggestSeatsAsync(int showtimeId, int familyPackageId, int userId);
    Task<BookingDto> CreateFamilyBookingAsync(int userId, CreateFamilyBookingDto dto);
}
