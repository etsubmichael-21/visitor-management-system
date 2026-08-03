using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcxVisitorManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddSupportingLetter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "attachment_content_type",
                table: "appointments",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "attachment_file_name",
                table: "appointments",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "attachment_original_name",
                table: "appointments",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "attachment_path",
                table: "appointments",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "attachment_size",
                table: "appointments",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "attachment_uploaded_at",
                table: "appointments",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "attachment_content_type",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "attachment_file_name",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "attachment_original_name",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "attachment_path",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "attachment_size",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "attachment_uploaded_at",
                table: "appointments");
        }
    }
}
