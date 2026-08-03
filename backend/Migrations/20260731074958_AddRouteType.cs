using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcxVisitorManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddRouteType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "route_type",
                table: "appointments",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "route_type",
                table: "appointments");
        }
    }
}
