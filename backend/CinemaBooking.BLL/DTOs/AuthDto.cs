namespace CinemaBooking.BLL.DTOs;

public record RegisterDto(string Email, string Password);

public record LoginDto(string Email, string Password);

public record AuthResultDto(string Token, string Email, string Role);
