using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcxVisitorManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddAppointmentMethodAndAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "appointment_method",
                table: "appointments",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "assigned_at",
                table: "appointments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "assigned_by",
                table: "appointments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "assigned_department_id",
                table: "appointments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "assigned_employee_id",
                table: "appointments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "redirect_reason",
                table: "appointments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "redirected_from_department_id",
                table: "appointments",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_appointments_assigned_department_id",
                table: "appointments",
                column: "assigned_department_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointments_assigned_employee_id",
                table: "appointments",
                column: "assigned_employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointments_redirected_from_department_id",
                table: "appointments",
                column: "redirected_from_department_id");

            migrationBuilder.AddForeignKey(
                name: "FK_appointments_departments_assigned_department_id",
                table: "appointments",
                column: "assigned_department_id",
                principalTable: "departments",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_appointments_departments_redirected_from_department_id",
                table: "appointments",
                column: "redirected_from_department_id",
                principalTable: "departments",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_appointments_employees_assigned_employee_id",
                table: "appointments",
                column: "assigned_employee_id",
                principalTable: "employees",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_appointments_departments_assigned_department_id",
                table: "appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_appointments_departments_redirected_from_department_id",
                table: "appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_appointments_employees_assigned_employee_id",
                table: "appointments");

            migrationBuilder.DropIndex(
                name: "IX_appointments_assigned_department_id",
                table: "appointments");

            migrationBuilder.DropIndex(
                name: "IX_appointments_assigned_employee_id",
                table: "appointments");

            migrationBuilder.DropIndex(
                name: "IX_appointments_redirected_from_department_id",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "appointment_method",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "assigned_at",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "assigned_by",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "assigned_department_id",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "assigned_employee_id",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "redirect_reason",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "redirected_from_department_id",
                table: "appointments");
        }
    }
}
