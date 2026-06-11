using CinemaBooking.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemaBooking.DAL.Configurations;

public class MovieConfiguration : IEntityTypeConfiguration<Movie>
{
    public void Configure(EntityTypeBuilder<Movie> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Title).IsRequired().HasMaxLength(255);
        builder.Property(m => m.Genre).IsRequired().HasMaxLength(100);
        builder.Property(m => m.PosterUrl).HasMaxLength(500);
        builder.Property(m => m.AgeRating).HasConversion<string>().HasMaxLength(5);
    }
}
