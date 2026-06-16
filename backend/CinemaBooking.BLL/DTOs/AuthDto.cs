namespace CinemaBooking.BLL.DTOs;

public record RegisterDto(string Email, string Password);

public record LoginDto(string Email, string Password);

public record AuthResultDto(string Token, string Email, string Role);

public record UserProfileDto(int Id, string Email, string Role);

public record ChangePasswordDto(string CurrentPassword, string NewPassword);

public record UserListItemDto(int Id, string Email, string Role);

public record ChangeRoleDto(string Role);
