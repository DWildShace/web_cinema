using AutoMapper;
using CinemaBooking.BLL.DTOs;
using CinemaBooking.Domain.Entities;

namespace CinemaBooking.BLL.Mappings;

public class MovieProfile : Profile
{
    public MovieProfile()
    {
        CreateMap<Movie, MovieDto>()
            .ForMember(d => d.AgeRating, o => o.MapFrom(s => s.AgeRating.ToString()));
        CreateMap<CreateMovieDto, Movie>();
    }
}
