using CinemaBooking.DAL;
using CinemaBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.API.BackgroundServices;

public class SeatExpiryService(IServiceScopeFactory scopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            using var scope = scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var expired = await context.BookingSeats
                .Where(bs => bs.Status == SeatStatus.Pending
                    && bs.ExpiresAt != null
                    && bs.ExpiresAt < DateTime.UtcNow)
                .ToListAsync(stoppingToken);

            if (expired.Count == 0) continue;

            var bookingIds = expired.Select(bs => bs.BookingId).Distinct().ToList();
            context.BookingSeats.RemoveRange(expired);
            await context.SaveChangesAsync(stoppingToken); // flush seat deletions first

            // Now query: bookings whose seats are all gone
            var emptyBookings = await context.Bookings
                .Where(b => bookingIds.Contains(b.Id) && !b.BookingSeats.Any())
                .ToListAsync(stoppingToken);
            context.Bookings.RemoveRange(emptyBookings);
            await context.SaveChangesAsync(stoppingToken);
        }
    }
}
