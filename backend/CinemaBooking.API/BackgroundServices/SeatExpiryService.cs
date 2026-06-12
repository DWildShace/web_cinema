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

            // ExpiresAt == null means "no expiry set" — treat as expired to prevent permanent seat locks
            var expired = await context.BookingSeats
                .Where(bs => bs.Status == SeatStatus.Pending
                    && (bs.ExpiresAt == null || bs.ExpiresAt < DateTime.UtcNow))
                .ToListAsync(stoppingToken);

            if (expired.Count == 0) continue;

            var bookingIds = expired.Select(bs => bs.BookingId).Distinct().ToList();

            await using var tx = await context.Database.BeginTransactionAsync(stoppingToken);
            try
            {
                context.BookingSeats.RemoveRange(expired);
                await context.SaveChangesAsync(stoppingToken);

                // Delete bookings that now have no seats left
                var emptyBookings = await context.Bookings
                    .Where(b => bookingIds.Contains(b.Id) && !b.BookingSeats.Any())
                    .ToListAsync(stoppingToken);
                context.Bookings.RemoveRange(emptyBookings);
                await context.SaveChangesAsync(stoppingToken);

                await tx.CommitAsync(stoppingToken);
            }
            catch
            {
                await tx.RollbackAsync(stoppingToken);
                throw;
            }
        }
    }
}
