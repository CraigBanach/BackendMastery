using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonifiBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaginationIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Transaction_UserCategory",
                table: "Transactions",
                columns: new[] { "UserId", "CategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_UserDate",
                table: "Transactions",
                columns: new[] { "UserId", "TransactionDate", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Transaction_UserCategory",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transaction_UserDate",
                table: "Transactions");
        }
    }
}
