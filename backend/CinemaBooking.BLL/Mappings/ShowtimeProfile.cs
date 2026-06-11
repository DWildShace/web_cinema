using AutoMapper;
using CinemaBooking.BLL.DTOs;
using CinemaBooking.Domain.Entities;

namespace CinemaBooking.BLL.Mappings;

public class ShowtimeProfile : Profile
{
    public ShowtimeProfile()
    {
        CreateMap<Showtime, ShowtimeDto>()
            .ForMember(d => d.MovieTitle, o => o.MapFrom(s => s.Movie.Title))
            .ForMember(d => d.HallName, o => o.MapFrom(s => s.Hall.Name))
            .ForMember(d => d.CinemaName, o => o.MapFrom(s => s.Hall.Cinema.Name));
        CreateMap<CreateShowtimeDto, Showtime>();
    }
}
