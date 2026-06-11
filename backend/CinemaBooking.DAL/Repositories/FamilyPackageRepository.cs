using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.DAL.Repositories;

public class FamilyPackageRepository(AppDbContext context)
    : BaseRepository<FamilyPackage>(context), IFamilyPackageRepository
{
    public async Task<IEnumerable<FamilyPackage>> GetActiveAsync() =>
        await _dbSet.Where(f => f.IsActive).ToListAsync();
}
