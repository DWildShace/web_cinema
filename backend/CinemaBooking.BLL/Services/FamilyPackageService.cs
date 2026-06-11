using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;

namespace CinemaBooking.BLL.Services;

public class FamilyPackageService(
    IFamilyPackageRepository packageRepo,
    IShowtimeRepository showtimeRepo) : IFamilyPackageService
{
    private const decimal ChildPriceFactor = 0.7m;

    public async Task<IEnumerable<FamilyPackageDto>> GetAllActiveAsync()
    {
        var packages = await packageRepo.GetActiveAsync();
        return packages.Select(p => new FamilyPackageDto(
            p.Id, p.Name, p.AdultCount, p.ChildCount, p.DiscountPct, p.IsActive));
    }

    public async Task<IEnumerable<FamilyPackagePricedDto>> GetPricedForShowtimeAsync(int showtimeId)
    {
        var showtime = await showtimeRepo.GetByIdAsync(showtimeId);
        if (showtime is null) return [];

        var packages = await packageRepo.GetActiveAsync();
        return packages.Select(p =>
        {
            var basePrice = showtime.Price * (p.AdultCount + p.ChildCount * ChildPriceFactor);
            var total = basePrice * (1 - p.DiscountPct);
            return new FamilyPackagePricedDto(p.Id, p.Name, p.AdultCount, p.ChildCount, total);
        });
    }

    public async Task<FamilyPackageDto> CreateAsync(CreateFamilyPackageDto dto)
    {
        var entity = new FamilyPackage
        {
            Name = dto.Name,
            AdultCount = dto.AdultCount,
            ChildCount = dto.ChildCount,
            DiscountPct = dto.DiscountPct
        };
        await packageRepo.AddAsync(entity);
        await packageRepo.SaveChangesAsync();
        return new FamilyPackageDto(entity.Id, entity.Name, entity.AdultCount, entity.ChildCount, entity.DiscountPct, entity.IsActive);
    }

    public async Task<FamilyPackageDto?> UpdateAsync(int id, UpdateFamilyPackageDto dto)
    {
        var entity = await packageRepo.GetByIdAsync(id);
        if (entity is null) return null;

        if (dto.Name is not null) entity.Name = dto.Name;
        if (dto.AdultCount.HasValue) entity.AdultCount = dto.AdultCount.Value;
        if (dto.ChildCount.HasValue) entity.ChildCount = dto.ChildCount.Value;
        if (dto.DiscountPct.HasValue) entity.DiscountPct = dto.DiscountPct.Value;
        if (dto.IsActive.HasValue) entity.IsActive = dto.IsActive.Value;

        packageRepo.Update(entity);
        await packageRepo.SaveChangesAsync();
        return new FamilyPackageDto(entity.Id, entity.Name, entity.AdultCount, entity.ChildCount, entity.DiscountPct, entity.IsActive);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var entity = await packageRepo.GetByIdAsync(id);
        if (entity is null) return false;
        entity.IsActive = false;
        packageRepo.Update(entity);
        await packageRepo.SaveChangesAsync();
        return true;
    }
}
