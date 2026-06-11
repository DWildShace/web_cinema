using CinemaBooking.Domain.Entities;

namespace CinemaBooking.DAL.Repositories.Interfaces;

public interface IFamilyPackageRepository : IRepository<FamilyPackage>
{
    Task<IEnumerable<FamilyPackage>> GetActiveAsync();
}
