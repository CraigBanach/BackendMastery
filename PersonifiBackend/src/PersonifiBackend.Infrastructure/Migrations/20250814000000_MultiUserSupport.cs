using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PersonifiBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MultiUserSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop existing data and constraints
            migrationBuilder.DropForeignKey(
                name: "FK_Budgets_Categories_CategoryId",
                table: "Budgets");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Categories_CategoryId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transaction_UserCategory",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transaction_UserDate",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_UserId_TransactionDate",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Categories_UserId_Name",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Budgets_UserId_CategoryId_Period",
                table: "Budgets");

            // Clear existing data since we're going clean
            migrationBuilder.Sql("DELETE FROM Transactions");
            migrationBuilder.Sql("DELETE FROM Budgets");
            migrationBuilder.Sql("DELETE FROM Categories");

            // Create new Users table
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Auth0UserId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            // Create Accounts table
            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.Id);
                });

            // Create UserAccounts junction table
            migrationBuilder.CreateTable(
                name: "UserAccounts",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    AccountId = table.Column<int>(type: "integer", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAccounts", x => new { x.UserId, x.AccountId });
                    table.ForeignKey(
                        name: "FK_UserAccounts_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserAccounts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create InvitationTokens table
            migrationBuilder.CreateTable(
                name: "InvitationTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Token = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PersonalMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    IsAccepted = table.Column<bool>(type: "boolean", nullable: false),
                    AcceptedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AccountId = table.Column<int>(type: "integer", nullable: false),
                    InviterUserId = table.Column<int>(type: "integer", nullable: false),
                    AcceptedByUserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvitationTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvitationTokens_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvitationTokens_Users_AcceptedByUserId",
                        column: x => x.AcceptedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_InvitationTokens_Users_InviterUserId",
                        column: x => x.InviterUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Update existing tables to use AccountId instead of UserId
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Budgets");

            // Drop old budget columns and add new ones
            migrationBuilder.DropColumn(
                name: "Period",
                table: "Budgets");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "Budgets");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Budgets");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Budgets");

            // Add new columns
            migrationBuilder.AddColumn<int>(
                name: "AccountId",
                table: "Transactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Transactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AccountId",
                table: "Categories",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AccountId",
                table: "Budgets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "Budgets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Month",
                table: "Budgets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Budgets",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Budgets",
                type: "timestamp without time zone",
                nullable: true);

            // Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_Users_Auth0UserId",
                table: "Users",
                column: "Auth0UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_AccountId",
                table: "UserAccounts",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTokens_Token",
                table: "InvitationTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTokens_Email",
                table: "InvitationTokens",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTokens_ExpiresAt",
                table: "InvitationTokens",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTokens_AccountId",
                table: "InvitationTokens",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTokens_InviterUserId",
                table: "InvitationTokens",
                column: "InviterUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTokens_AcceptedByUserId",
                table: "InvitationTokens",
                column: "AcceptedByUserId");

            // Update existing table indexes
            migrationBuilder.CreateIndex(
                name: "IX_Transaction_AccountDate",
                table: "Transactions",
                columns: new[] { "AccountId", "TransactionDate", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_AccountCategory",
                table: "Transactions",
                columns: new[] { "AccountId", "CategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_AccountId",
                table: "Transactions",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CreatedByUserId",
                table: "Transactions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_AccountId",
                table: "Categories",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_AccountId_Name",
                table: "Categories",
                columns: new[] { "AccountId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_AccountId",
                table: "Budgets",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_AccountId_CategoryId_Year_Month",
                table: "Budgets",
                columns: new[] { "AccountId", "CategoryId", "Year", "Month" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_AccountId_Year_Month",
                table: "Budgets",
                columns: new[] { "AccountId", "Year", "Month" });

            // Add foreign keys
            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Accounts_AccountId",
                table: "Budgets",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Budgets_Categories_CategoryId",
                table: "Budgets",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Accounts_AccountId",
                table: "Categories",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Accounts_AccountId",
                table: "Transactions",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Categories_CategoryId",
                table: "Transactions",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Users_CreatedByUserId",
                table: "Transactions",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // This would be a complex rollback since we're restructuring the schema
            // For clean approach, we'd drop everything and recreate original structure
            throw new NotSupportedException("This migration represents a major schema change. Rollback not supported for clean schema approach.");
        }
    }
}