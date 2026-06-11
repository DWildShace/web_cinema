using AutoMapper;
using CinemaBooking.BLL.DTOs;
using CinemaBooking.BLL.Services.Interfaces;
using CinemaBooking.DAL.Repositories.Interfaces;
using CinemaBooking.Domain.Entities;

namespace CinemaBooking.BLL.Services;

public class MovieService(IMovieRepository repo, IMapper mapper) : IMovieService
{
    public async Task<IEnumerable<MovieDto>> GetAllAsync()
    {
        var movies = await repo.GetAllAsync();
        return mapper.Map<IEnumerable<MovieDto>>(movies);
    }

    public async Task<MovieDto?> GetByIdAsync(int id)
    {
        var movie = await repo.GetByIdAsync(id);
        return movie is null ? null : mapper.Map<MovieDto>(movie);
    }

    public async Task<MovieDto> CreateAsync(CreateMovieDto dto)
    {
        var movie = mapper.Map<Movie>(dto);
        await repo.AddAsync(movie);
        await repo.SaveChangesAsync();
        return mapper.Map<MovieDto>(movie);
    }

    public async Task<MovieDto?> UpdateAsync(int id, UpdateMovieDto dto)
    {
        var movie = await repo.GetByIdAsync(id);
        if (movie is null) return null;

        if (dto.Title is not null) movie.Title = dto.Title;
        if (dto.Genre is not null) movie.Genre = dto.Genre;
        if (dto.Duration.HasValue) movie.Duration = dto.Duration.Value;
        if (dto.PosterUrl is not null) movie.PosterUrl = dto.PosterUrl;
        if (dto.Rating.HasValue) movie.Rating = dto.Rating.Value;

        repo.Update(movie);
        await repo.SaveChangesAsync();
        return mapper.Map<MovieDto>(movie);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var movie = await repo.GetByIdAsync(id);
        if (movie is null) return false;
        repo.Remove(movie);
        await repo.SaveChangesAsync();
        return true;
    }
}
