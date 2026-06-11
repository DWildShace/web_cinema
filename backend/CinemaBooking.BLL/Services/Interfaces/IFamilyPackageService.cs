using CinemaBooking.BLL.DTOs;

namespace CinemaBooking.BLL.Services.Interfaces;

public interface IFamilyPackageService
{
    Task<IEnumerable<FamilyPackageDto>> GetAllActiveAsync();
    Task<IEnumerable<FamilyPackagePricedDto>> GetPricedForShowtimeAsync(int showtimeId);
    Task<FamilyPackageDto> CreateAsync(CreateFamilyPackageDto dto);
    Task<FamilyPackageDto?> UpdateAsync(int id, UpdateFamilyPackageDto dto);
    Task<bool> DeactivateAsync(int id);
}
