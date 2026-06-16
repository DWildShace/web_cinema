using System.Collections.Concurrent;

namespace CinemaBooking.API.Services;

public class LoginRateLimiter
{
    private readonly record struct AttemptRecord(int Count, DateTime LockedUntil);

    private readonly ConcurrentDictionary<string, AttemptRecord> _store = new(StringComparer.OrdinalIgnoreCase);
    private const int MaxAttempts = 5;
    private static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(15);

    public bool IsLocked(string email)
    {
        if (_store.TryGetValue(email, out var rec) && rec.LockedUntil > DateTime.UtcNow)
            return true;
        return false;
    }

    public TimeSpan? LockRemainingTime(string email)
    {
        if (_store.TryGetValue(email, out var rec) && rec.LockedUntil > DateTime.UtcNow)
            return rec.LockedUntil - DateTime.UtcNow;
        return null;
    }

    public void RecordFailure(string email)
    {
        _store.AddOrUpdate(email,
            _ => new AttemptRecord(1, DateTime.MinValue),
            (_, old) =>
            {
                var newCount = old.Count + 1;
                var lockedUntil = newCount >= MaxAttempts ? DateTime.UtcNow.Add(LockDuration) : old.LockedUntil;
                return new AttemptRecord(newCount, lockedUntil);
            });
    }

    public void Reset(string email) => _store.TryRemove(email, out _);
}
