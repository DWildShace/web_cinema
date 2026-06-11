using AutoMapper;
using CinemaBooking.BLL.DTOs;
using CinemaBooking.Domain.Entities;

namespace CinemaBooking.BLL.Mappings;

public class BookingProfile : Profile
{
    public BookingProfile()
    {
        CreateMap<Booking, BookingDto>()
            .ForMember(d => d.MovieTitle, o => o.MapFrom(s => s.Showtime.Movie.Title))
            .ForMember(d => d.StartsAt, o => o.MapFrom(s => s.Showtime.StartsAt));
        CreateMap<BookingSeat, BookingSeatDto>()
            .ForMember(d => d.Row, o => o.MapFrom(s => s.Seat.Row))
            .ForMember(d => d.Column, o => o.MapFrom(s => s.Seat.Column))
            .ForMember(d => d.SeatType, o => o.MapFrom(s => s.Seat.Type.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
    }
}
