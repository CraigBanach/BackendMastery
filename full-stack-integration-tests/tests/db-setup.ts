import { Client } from "pg";

const CONNECTION_STRING = "postgres://postgres:password@localhost:5435/personifi_db";

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
  const client = new Client({ connectionString: CONNECTION_STRING });

  try {
    await client.connect();

    console.log("Resetting database...");

    await client.query("BEGIN");
    await client.query('TRUNCATE TABLE "Users", "Subscriptions", "Accounts", "InvitationTokens" CASCADE');

    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth() + 1;

    // Create primary test user with account (simulates user who already has account)
    const userResult = await client.query(
      'INSERT INTO "Users" ("Auth0UserId", "Email", "CreatedAt", "Role", "InvitePromptDismissed") VALUES ($1, $2, $3, $4, $5) RETURNING "Id"',
      ["test-user-sub", "test@example.com", now, "owner", true]
    );
    const userId = userResult.rows[0].Id as number;

    const accountResult = await client.query(
      'INSERT INTO "Accounts" ("Name", "CreatedAt", "IsArchived") VALUES ($1, $2, $3) RETURNING "Id"',
      ["Test Household", now, false]
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

    // Create a second user WITHOUT account - to test auto-account creation
    // Note: The new-user-sub user will get an account auto-created when they log in
    await client.query(
      'INSERT INTO "Users" ("Auth0UserId", "Email", "CreatedAt", "InvitePromptDismissed") VALUES ($1, $2, $3, $4)',
      ["new-user-sub", "newuser@example.com", now, false]
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

/**
 * Creates an invitation token for testing the switch account flow.
 * Returns the token string.
 */
export async function createInvitationToken(
  accountId: number,
  inviterUserId: number,
  options?: { expired?: boolean; accepted?: boolean }
): Promise<string> {
  const client = new Client({ connectionString: CONNECTION_STRING });

  try {
    await client.connect();

    const token = `test-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    const expiresAt = options?.expired
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    await client.query(
      `INSERT INTO "InvitationTokens" 
       ("Token", "AccountId", "InviterUserId", "ExpiresAt", "CreatedAt", "IsAccepted", "AcceptedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        token,
        accountId,
        inviterUserId,
        expiresAt,
        now,
        options?.accepted ?? false,
        options?.accepted ? now : null,
      ]
    );

    return token;
  } finally {
    await client.end();
  }
}

/**
 * Gets the account ID and user ID for a given Auth0 user ID.
 */
export async function getUserAndAccountIds(
  auth0UserId: string
): Promise<{ userId: number; accountId: number | null }> {
  const client = new Client({ connectionString: CONNECTION_STRING });

  try {
    await client.connect();

    const result = await client.query(
      `SELECT u."Id" as "userId", s."AccountId" as "accountId"
       FROM "Users" u
       LEFT JOIN "Subscriptions" s ON u."SubscriptionId" = s."Id"
       WHERE u."Auth0UserId" = $1`,
      [auth0UserId]
    );

    if (result.rows.length === 0) {
      throw new Error(`User not found: ${auth0UserId}`);
    }

    return {
      userId: result.rows[0].userId,
      accountId: result.rows[0].accountId,
    };
  } finally {
    await client.end();
  }
}

/**
 * Checks if a user has an account with the expected name.
 */
export async function verifyUserAccount(
  auth0UserId: string,
  expectedAccountName: string
): Promise<boolean> {
  const client = new Client({ connectionString: CONNECTION_STRING });

  try {
    await client.connect();

    const result = await client.query(
      `SELECT a."Name"
       FROM "Users" u
       JOIN "Subscriptions" s ON u."SubscriptionId" = s."Id"
       JOIN "Accounts" a ON s."AccountId" = a."Id"
       WHERE u."Auth0UserId" = $1`,
      [auth0UserId]
    );

    return result.rows.length > 0 && result.rows[0].Name === expectedAccountName;
  } finally {
    await client.end();
  }
}

/**
 * Checks if an account is archived.
 */
export async function isAccountArchived(accountId: number): Promise<boolean> {
  const client = new Client({ connectionString: CONNECTION_STRING });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT "IsArchived" FROM "Accounts" WHERE "Id" = $1',
      [accountId]
    );

    return result.rows.length > 0 && result.rows[0].IsArchived === true;
  } finally {
    await client.end();
  }
}

/**
 * Counts categories for an account.
 */
export async function countAccountCategories(accountId: number): Promise<number> {
  const client = new Client({ connectionString: CONNECTION_STRING });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT COUNT(*) as count FROM "Categories" WHERE "AccountId" = $1',
      [accountId]
    );

    return parseInt(result.rows[0].count, 10);
  } finally {
    await client.end();
  }
}
