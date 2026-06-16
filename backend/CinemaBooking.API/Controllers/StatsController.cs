using CinemaBooking.DAL;
using CinemaBooking.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.API.Controllers;

[ApiController]
[Route("api/stats")]
[Authorize(Roles = "CinemaManager,SysAdmin")]
public class StatsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetStats()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var todayBookings = await db.Bookings
            .CountAsync(b => b.BookingSeats.Any(s => s.Status == SeatStatus.Confirmed)
                             && b.CreatedAt >= today && b.CreatedAt < tomorrow);

        var totalBookings = await db.Bookings
            .CountAsync(b => b.BookingSeats.Any(s => s.Status == SeatStatus.Confirmed));

        var totalMovies = await db.Movies.CountAsync();
        var totalCustomers = await db.Users.CountAsync(u => u.Role == UserRole.Customer);

        return Ok(new { todayBookings, totalBookings, totalMovies, totalCustomers });
    }
}
