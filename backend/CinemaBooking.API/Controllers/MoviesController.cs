using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.API.Controllers;

[ApiController]
[Route("api/movies")]
public class MoviesController(IMovieService movieService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await movieService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var movie = await movieService.GetByIdAsync(id);
        return movie is null ? NotFound() : Ok(movie);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,CinemaManager,SysAdmin")]
    public async Task<IActionResult> Create(CreateMovieDto dto) =>
        CreatedAtAction(nameof(GetById), new { id = 0 }, await movieService.CreateAsync(dto));

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,CinemaManager,SysAdmin")]
    public async Task<IActionResult> Update(int id, UpdateMovieDto dto)
    {
        var result = await movieService.UpdateAsync(id, dto);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,CinemaManager,SysAdmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await movieService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
