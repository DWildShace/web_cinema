using CinemaBooking.DAL;
using CinemaBooking.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.API.Controllers;

[ApiController]
[Route("api/cinemas")]
public class CinemasController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cinemas = await db.Cinemas
            .Include(c => c.Halls)
            .OrderBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Location,
                hallCount = c.Halls.Count,
                halls = c.Halls.Select(h => new { h.Id, h.Name, h.Rows, h.Columns })
            })
            .ToListAsync();
        return Ok(cinemas);
    }

    [HttpPost]
    [Authorize(Roles = "SysAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateCinemaDto dto)
    {
        var cinema = new Cinema { Name = dto.Name, Location = dto.Location };
        db.Cinemas.Add(cinema);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { }, new { cinema.Id, cinema.Name, cinema.Location });
    }
}

public record CreateCinemaDto(string Name, string Location);
