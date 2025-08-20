using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonifiBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInvitePromptDismissedToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "InvitePromptDismissed",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvitePromptDismissed",
                table: "Users");
        }
    }
}
