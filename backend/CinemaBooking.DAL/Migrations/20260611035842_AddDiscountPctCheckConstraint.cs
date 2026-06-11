using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CinemaBooking.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountPctCheckConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_FamilyPackages_DiscountPct",
                table: "FamilyPackages",
                sql: "\"DiscountPct\" >= 0 AND \"DiscountPct\" <= 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_FamilyPackages_DiscountPct",
                table: "FamilyPackages");
        }
    }
}
