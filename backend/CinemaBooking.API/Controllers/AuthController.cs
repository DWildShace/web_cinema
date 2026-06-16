using CinemaBooking.API.Services;
using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, LoginRateLimiter rateLimiter) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            return Ok(await authService.RegisterAsync(dto));
        }
        catch (InvalidOperationException ex) { return Conflict(new { error = ex.Message }); }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var email = dto.Email?.Trim() ?? string.Empty;

        var remaining = rateLimiter.LockRemainingTime(email);
        if (remaining is not null)
        {
            var minutes = (int)Math.Ceiling(remaining.Value.TotalMinutes);
            return StatusCode(429, new { error = $"Tài khoản tạm khóa do quá nhiều lần thử sai. Vui lòng thử lại sau {minutes} phút." });
        }

        try
        {
            var result = await authService.LoginAsync(dto);
            rateLimiter.Reset(email);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            rateLimiter.RecordFailure(email);
            return Unauthorized(new { error = ex.Message });
        }
    }
}
