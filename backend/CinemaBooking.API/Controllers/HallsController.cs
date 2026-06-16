using CinemaBooking.DAL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.API.Controllers;

[ApiController]
[Route("api/halls")]
[Authorize(Roles = "Admin,CinemaManager,SysAdmin")]
public class HallsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var halls = await db.Halls
            .Include(h => h.Cinema)
            .OrderBy(h => h.Cinema.Name).ThenBy(h => h.Name)
            .Select(h => new { h.Id, h.Name, h.Rows, h.Columns, cinemaName = h.Cinema.Name })
            .ToListAsync();
        return Ok(halls);
    }
}
