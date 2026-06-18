using System.Security.Claims;
using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.API.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController(IBookingService bookingService) : ControllerBase
{
    private int? CurrentUserId => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet]
    public async Task<IActionResult> GetMyBookings()
    {
        if (CurrentUserId is not { } uid) return Unauthorized();
        return Ok(await bookingService.GetUserBookingsAsync(uid));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        if (CurrentUserId is not { } uid) return Unauthorized();
        var booking = await bookingService.GetByIdAsync(uid, id);
        return booking is null ? NotFound() : Ok(booking);
    }

    [HttpGet("by-code/{code}")]
    [Authorize(Roles = "CinemaStaff,CinemaManager,SysAdmin,Admin")]
    public async Task<IActionResult> GetByCode(string code)
    {
        var booking = await bookingService.GetByTicketCodeAsync(code);
        return booking is null ? NotFound(new { error = "Không tìm thấy vé." }) : Ok(booking);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBookingDto dto)
    {
        if (CurrentUserId is not { } uid) return Unauthorized();
        try
        {
            var booking = await bookingService.CreateAsync(uid, dto);
            return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { error = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Cancel(int id)
    {
        if (CurrentUserId is not { } uid) return Unauthorized();
        try
        {
            var ok = await bookingService.CancelAsync(uid, id);
            return ok ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex) { return Conflict(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/checkin")]
    [Authorize(Roles = "CinemaStaff,CinemaManager,SysAdmin,Admin")]
    public async Task<IActionResult> CheckIn(int id)
    {
        try
        {
            var booking = await bookingService.CheckInAsync(id);
            return booking is null ? NotFound(new { error = "Không tìm thấy booking." }) : Ok(booking);
        }
        catch (InvalidOperationException ex) { return Conflict(new { error = ex.Message }); }
    }
}
