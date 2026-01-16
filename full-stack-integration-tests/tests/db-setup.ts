import { Client } from "pg";

type DefaultCategory = {
  name: string;
  type: number;
  icon: string;
  color: string;
  budgetAmount: number;
};

const defaultCategories: DefaultCategory[] = [
  {
    name: "Salary",
    type: 0,
    icon: "💰",
    color: "#22c55e",
    budgetAmount: 4000,
  },
  {
    name: "Food Shopping",
    type: 1,
    icon: "🛒",
    color: "#ef4444",
    budgetAmount: 600,
  },
  {
    name: "Rent/Mortgage",
    type: 1,
    icon: "🏠",
    color: "#3b82f6",
    budgetAmount: 1200,
  },
  {
    name: "Utilities",
    type: 1,
    icon: "⚡",
    color: "#f59e0b",
    budgetAmount: 200,
  },
  {
    name: "Transport",
    type: 1,
    icon: "🚗",
    color: "#8b5cf6",
    budgetAmount: 300,
  },
  {
    name: "Eating Out",
    type: 1,
    icon: "🍽️",
    color: "#ec4899",
    budgetAmount: 200,
  },
  {
    name: "Entertainment",
    type: 1,
    icon: "🎬",
    color: "#06b6d4",
    budgetAmount: 150,
  },
  {
    name: "Healthcare",
    type: 1,
    icon: "🏥",
    color: "#10b981",
    budgetAmount: 100,
  },
  {
    name: "Clothing",
    type: 1,
    icon: "👕",
    color: "#f97316",
    budgetAmount: 100,
  },
  {
    name: "Savings",
    type: 1,
    icon: "🏦",
    color: "#6366f1",
    budgetAmount: 500,
  },
];

export async function resetDatabase() {
  const client = new Client({
    connectionString:
      "postgres://postgres:password@localhost:5435/personifi_db",
  });

  try {
    await client.connect();

    console.log("Resetting database...");

    await client.query("BEGIN");
    await client.query('TRUNCATE TABLE "Users", "Subscriptions" CASCADE');

    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth() + 1;

    const userResult = await client.query(
      'INSERT INTO "Users" ("Auth0UserId", "Email", "CreatedAt", "Role", "InvitePromptDismissed") VALUES ($1, $2, $3, $4, $5) RETURNING "Id"',
      ["test-user-sub", "test@example.com", now, "owner", true]
    );
    const userId = userResult.rows[0].Id as number;

    const accountResult = await client.query(
      'INSERT INTO "Accounts" ("Name", "CreatedAt") VALUES ($1, $2) RETURNING "Id"',
      ["Test Household", now]
    );
    const accountId = accountResult.rows[0].Id as number;

    const subscriptionResult = await client.query(
      'INSERT INTO "Subscriptions" ("OwnerUserId", "AccountId", "CreatedAt") VALUES ($1, $2, $3) RETURNING "Id"',
      [userId, accountId, now]
    );
    const subscriptionId = subscriptionResult.rows[0].Id as number;

    await client.query(
      'UPDATE "Users" SET "SubscriptionId" = $1 WHERE "Id" = $2',
      [subscriptionId, userId]
    );
    await client.query(
      'UPDATE "Accounts" SET "SubscriptionId" = $1 WHERE "Id" = $2',
      [subscriptionId, accountId]
    );

    for (const category of defaultCategories) {
      const categoryResult = await client.query(
        'INSERT INTO "Categories" ("Name", "Type", "Icon", "Color", "AccountId") VALUES ($1, $2, $3, $4, $5) RETURNING "Id"',
        [category.name, category.type, category.icon, category.color, accountId]
      );

      const categoryId = categoryResult.rows[0].Id as number;
      await client.query(
        'INSERT INTO "Budgets" ("AccountId", "CategoryId", "Amount", "Year", "Month", "CreatedAt") VALUES ($1, $2, $3, $4, $5, $6)',
        [
          accountId,
          categoryId,
          category.budgetAmount,
          currentYear,
          currentMonth,
          now,
        ]
      );
    }

    await client.query(
      'INSERT INTO "Users" ("Auth0UserId", "Email", "CreatedAt", "Role", "InvitePromptDismissed") VALUES ($1, $2, $3, $4, $5)',
      ["new-user-sub", "newuser@example.com", now, "owner", false]
    );

    await client.query("COMMIT");

    console.log("Database reset complete.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to reset database:", error);
    throw error;
  } finally {
    await client.end();
  }
}
