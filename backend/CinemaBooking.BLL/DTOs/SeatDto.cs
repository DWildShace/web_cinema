namespace CinemaBooking.BLL.DTOs;

public record SeatWithStatusDto(int Id, int Row, int Column, string SeatType, bool IsAvailable);
