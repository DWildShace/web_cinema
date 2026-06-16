using CinemaBooking.BLL.DTOs;

namespace CinemaBooking.BLL.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResultDto> RegisterAsync(RegisterDto dto);
    Task<AuthResultDto> LoginAsync(LoginDto dto);
    Task<UserProfileDto> GetProfileAsync(int userId);
    Task ChangePasswordAsync(int userId, ChangePasswordDto dto);
}
