using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonifiBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAccountForJoining : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "Accounts",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Accounts",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Accounts");
        }
    }
}
