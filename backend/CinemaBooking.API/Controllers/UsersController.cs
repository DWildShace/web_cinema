using System.Security.Claims;
using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(IAuthService authService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        try { return Ok(await authService.GetProfileAsync(UserId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        try
        {
            await authService.ChangePasswordAsync(UserId, dto);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (UnauthorizedAccessException ex) { return BadRequest(new { error = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
    }

    // SysAdmin only
    [HttpGet]
    [Authorize(Roles = "SysAdmin")]
    public async Task<IActionResult> GetAllUsers()
    {
        return Ok(await authService.GetAllUsersAsync());
    }

    [HttpPut("{id:int}/role")]
    [Authorize(Roles = "SysAdmin")]
    public async Task<IActionResult> ChangeRole(int id, ChangeRoleDto dto)
    {
        try
        {
            await authService.ChangeUserRoleAsync(id, dto);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
    }
}
