using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcxVisitorManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddUnavailabilityTimeAndRepeat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeOnly>(
                name: "end_time",
                table: "employee_unavailability",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "repeat",
                table: "employee_unavailability",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "start_time",
                table: "employee_unavailability",
                type: "time without time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "end_time",
                table: "employee_unavailability");

            migrationBuilder.DropColumn(
                name: "repeat",
                table: "employee_unavailability");

            migrationBuilder.DropColumn(
                name: "start_time",
                table: "employee_unavailability");
        }
    }
}
