using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.API.Controllers;

[ApiController]
public class ShowtimesController(IShowtimeService showtimeService) : ControllerBase
{
    [HttpGet("api/showtimes")]
    [Authorize(Roles = "Admin,CinemaManager,SysAdmin")]
    public async Task<IActionResult> GetAll() =>
        Ok(await showtimeService.GetAllAsync());

    [HttpGet("api/movies/{movieId:int}/showtimes")]
    public async Task<IActionResult> GetByMovie(int movieId) =>
        Ok(await showtimeService.GetByMovieIdAsync(movieId));

    [HttpGet("api/showtimes/{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var showtime = await showtimeService.GetByIdAsync(id);
        return showtime is null ? NotFound() : Ok(showtime);
    }

    [HttpGet("api/showtimes/{id:int}/seats")]
    public async Task<IActionResult> GetSeatsWithStatus(int id)
    {
        try
        {
            return Ok(await showtimeService.GetSeatsWithStatusAsync(id));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpPost("api/showtimes")]
    [Authorize(Roles = "Admin,CinemaManager,SysAdmin")]
    public async Task<IActionResult> Create(CreateShowtimeDto dto)
    {
        var showtime = await showtimeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = showtime.Id }, showtime);
    }

    [HttpDelete("api/showtimes/{id:int}")]
    [Authorize(Roles = "Admin,CinemaManager,SysAdmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await showtimeService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
