using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcxVisitorManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitorPropertySelection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "has_properties",
                table: "appointments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "property_name",
                table: "appointment_properties",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "has_properties",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "property_name",
                table: "appointment_properties");
        }
    }
}
