﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PersonifiBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTransactionImport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TransactionImports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TotalTransactions = table.Column<int>(type: "integer", nullable: false),
                    ProcessedTransactions = table.Column<int>(type: "integer", nullable: false),
                    ApprovedTransactions = table.Column<int>(type: "integer", nullable: false),
                    RejectedTransactions = table.Column<int>(type: "integer", nullable: false),
                    DuplicateTransactions = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    AccountId = table.Column<int>(type: "integer", nullable: false),
                    ImportedByUserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransactionImports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransactionImports_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransactionImports_Users_ImportedByUserId",
                        column: x => x.ImportedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PendingTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExternalTransactionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CounterParty = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Reference = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Balance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ExternalSpendingCategory = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    TransactionDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    AccountId = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: true),
                    ImportedByUserId = table.Column<int>(type: "integer", nullable: false),
                    TransactionImportId = table.Column<int>(type: "integer", nullable: false),
                    RawData = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PendingTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PendingTransactions_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PendingTransactions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PendingTransactions_TransactionImports_TransactionImportId",
                        column: x => x.TransactionImportId,
                        principalTable: "TransactionImports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PendingTransactions_Users_ImportedByUserId",
                        column: x => x.ImportedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PendingTransactions_AccountId_ExternalTransactionId",
                table: "PendingTransactions",
                columns: new[] { "AccountId", "ExternalTransactionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PendingTransactions_AccountId_TransactionDate",
                table: "PendingTransactions",
                columns: new[] { "AccountId", "TransactionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_PendingTransactions_CategoryId",
                table: "PendingTransactions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_PendingTransactions_ImportedByUserId",
                table: "PendingTransactions",
                column: "ImportedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PendingTransactions_TransactionImportId",
                table: "PendingTransactions",
                column: "TransactionImportId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionImports_AccountId",
                table: "TransactionImports",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionImports_ImportedByUserId",
                table: "TransactionImports",
                column: "ImportedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PendingTransactions");

            migrationBuilder.DropTable(
                name: "TransactionImports");
        }
    }
}
