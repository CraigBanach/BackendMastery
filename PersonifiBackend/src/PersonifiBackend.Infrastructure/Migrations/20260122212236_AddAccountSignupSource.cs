using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonifiBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountSignupSource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SignupSource",
                table: "Accounts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SignupSource",
                table: "Accounts");
        }
    }
}
