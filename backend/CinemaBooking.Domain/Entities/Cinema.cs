namespace CinemaBooking.Domain.Entities;

public class Cinema
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;

    public ICollection<Hall> Halls { get; set; } = [];
}
