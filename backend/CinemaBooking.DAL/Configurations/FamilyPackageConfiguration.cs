using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemaBooking.DAL.Configurations;

public class FamilyPackageConfiguration : IEntityTypeConfiguration<FamilyPackage>
{
    public void Configure(EntityTypeBuilder<FamilyPackage> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Name).IsRequired().HasMaxLength(100);
        builder.Property(f => f.DiscountPct).HasColumnType("decimal(5,4)");
        builder.ToTable(t => t.HasCheckConstraint("CK_FamilyPackages_DiscountPct", "\"DiscountPct\" >= 0 AND \"DiscountPct\" <= 1"));
    }
}
