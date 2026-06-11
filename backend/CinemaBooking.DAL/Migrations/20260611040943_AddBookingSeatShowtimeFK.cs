using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CinemaBooking.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingSeatShowtimeFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_BookingSeats_ShowtimeId",
                table: "BookingSeats",
                column: "ShowtimeId");

            migrationBuilder.AddForeignKey(
                name: "FK_BookingSeats_Showtimes_ShowtimeId",
                table: "BookingSeats",
                column: "ShowtimeId",
                principalTable: "Showtimes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookingSeats_Showtimes_ShowtimeId",
                table: "BookingSeats");

            migrationBuilder.DropIndex(
                name: "IX_BookingSeats_ShowtimeId",
                table: "BookingSeats");
        }
    }
}
