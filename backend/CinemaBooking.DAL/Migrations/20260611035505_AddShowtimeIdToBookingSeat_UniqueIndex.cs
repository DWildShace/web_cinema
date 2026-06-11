using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CinemaBooking.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddShowtimeIdToBookingSeat_UniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BookingSeats_SeatId",
                table: "BookingSeats");

            migrationBuilder.AddColumn<int>(
                name: "ShowtimeId",
                table: "BookingSeats",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_BookingSeats_SeatId_ShowtimeId",
                table: "BookingSeats",
                columns: new[] { "SeatId", "ShowtimeId" },
                unique: true,
                filter: "\"Status\" = 'Confirmed'");

            migrationBuilder.CreateIndex(
                name: "IX_BookingSeats_Status_ExpiresAt",
                table: "BookingSeats",
                columns: new[] { "Status", "ExpiresAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BookingSeats_SeatId_ShowtimeId",
                table: "BookingSeats");

            migrationBuilder.DropIndex(
                name: "IX_BookingSeats_Status_ExpiresAt",
                table: "BookingSeats");

            migrationBuilder.DropColumn(
                name: "ShowtimeId",
                table: "BookingSeats");

            migrationBuilder.CreateIndex(
                name: "IX_BookingSeats_SeatId",
                table: "BookingSeats",
                column: "SeatId");
        }
    }
}
