using System.Security.Claims;
using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.API.Controllers;

[ApiController]
public class FamilyBookingController(
    IFamilyPackageService packageService,
    IFamilyBookingService bookingService,
    IMovieService movieService) : ControllerBase
{
    [HttpGet("api/movies/family-friendly")]
    public async Task<IActionResult> GetFamilyFriendlyMovies()
    {
        var familyRatings = new HashSet<string> { "P", "K", "T13" };
        var all = await movieService.GetAllAsync();
        var sorted = all
            .OrderByDescending(m => familyRatings.Contains(m.AgeRating))
            .ThenBy(m => m.Title);
        return Ok(sorted);
    }

    [HttpGet("api/showtimes/{id}/family-packages")]
    public async Task<IActionResult> GetPricedPackages(int id) =>
        Ok(await packageService.GetPricedForShowtimeAsync(id));

    [HttpPost("api/showtimes/{id}/seats/suggest")]
    [Authorize]
    public async Task<IActionResult> SuggestSeats(int id, SuggestSeatsRequestDto dto)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized();
        try
        {
            return Ok(await bookingService.SuggestSeatsAsync(id, dto.FamilyPackageId, userId));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpPost("api/bookings/family")]
    [Authorize]
    public async Task<IActionResult> CreateFamilyBooking(CreateFamilyBookingDto dto)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized();
        try
        {
            return Ok(await bookingService.CreateFamilyBookingAsync(userId, dto));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return Conflict(new { error = ex.Message }); }
    }
}
