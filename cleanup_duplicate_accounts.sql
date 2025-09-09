-- SQL Cleanup Queries for Duplicate Account Creation
-- WARNING: These queries will permanently delete data. Use with caution.
-- Run these in the correct order to avoid foreign key constraint violations.

-- SET YOUR USER ID HERE (change the 35 to your actual user ID):
DO $$
DECLARE
    user_id INTEGER := 35;
BEGIN

-- Step 1: Delete related entities first (to avoid foreign key constraint violations)

    -- Delete TransactionImports (if any exist for the accounts to be deleted)
    DELETE FROM "TransactionImports"
    WHERE "AccountId" IN (
        SELECT a."Id" 
        FROM "Accounts" a
        INNER JOIN "Subscriptions" s ON a."SubscriptionId" = s."Id"
        WHERE s."OwnerUserId" = user_id
    );

    -- Delete Budgets
    DELETE FROM "Budgets"
    WHERE "AccountId" IN (
        SELECT a."Id" 
        FROM "Accounts" a
        INNER JOIN "Subscriptions" s ON a."SubscriptionId" = s."Id"
        WHERE s."OwnerUserId" = user_id
    );

    -- Delete Transactions
    DELETE FROM "Transactions"
    WHERE "AccountId" IN (
        SELECT a."Id" 
        FROM "Accounts" a
        INNER JOIN "Subscriptions" s ON a."SubscriptionId" = s."Id"
        WHERE s."OwnerUserId" = user_id
    );

    -- Delete Categories
    DELETE FROM "Categories"
    WHERE "AccountId" IN (
        SELECT a."Id" 
        FROM "Accounts" a
        INNER JOIN "Subscriptions" s ON a."SubscriptionId" = s."Id"
        WHERE s."OwnerUserId" = user_id
    );

    -- Delete InvitationTokens
    DELETE FROM "InvitationTokens"
    WHERE "AccountId" IN (
        SELECT a."Id" 
        FROM "Accounts" a
        INNER JOIN "Subscriptions" s ON a."SubscriptionId" = s."Id"
        WHERE s."OwnerUserId" = user_id
    );

    -- Step 2: Break all foreign key relationships first
    -- Set User.SubscriptionId to NULL to break the reference from Users to Subscriptions
    UPDATE "Users"
    SET "SubscriptionId" = NULL
    WHERE "SubscriptionId" IN (
        SELECT "Id" FROM "Subscriptions"
        WHERE "OwnerUserId" = user_id
    );

    -- Set Account.SubscriptionId to NULL to break the circular reference
    UPDATE "Accounts"
    SET "SubscriptionId" = NULL
    WHERE "SubscriptionId" IN (
        SELECT "Id" FROM "Subscriptions"
        WHERE "OwnerUserId" = user_id
    );

    -- Step 3: Delete Subscriptions (now that all references are broken)
    DELETE FROM "Subscriptions"
    WHERE "OwnerUserId" = user_id;

    -- Step 4: Delete Accounts (now orphaned)
    DELETE FROM "Accounts"
    WHERE "Id" IN (
        SELECT a."Id" 
        FROM "Accounts" a
        WHERE a."SubscriptionId" IS NULL
    );

    -- Step 5: Delete the User record (completes the cleanup)
    DELETE FROM "Users"
    WHERE "Id" = user_id;

END $$;

-- Alternative: Keep only the most recent account (if you want to keep one)
-- This query identifies accounts to keep vs delete:

/*
-- Query to show all accounts for your user (for review before deletion):
SELECT 
    u."Auth0UserId",
    u."Id" as "UserId",
    s."Id" as "SubscriptionId", 
    a."Id" as "AccountId",
    a."Name" as "AccountName",
    a."CreatedAt"
FROM "Users" u
INNER JOIN "Subscriptions" s ON u."Id" = s."OwnerUserId"
INNER JOIN "Accounts" a ON s."Id" = a."SubscriptionId"
WHERE u."Id" = YOUR_USER_ID_HERE -- Replace with your actual user ID
ORDER BY a."CreatedAt" DESC;
*/

-- If you want to keep only the most recent account, modify the delete queries above 
-- to exclude the most recent one by adding:
-- AND a."Id" != (
--     SELECT a2."Id" 
--     FROM "Accounts" a2
--     INNER JOIN "Subscriptions" s2 ON a2."SubscriptionId" = s2."Id"
--     WHERE s2."OwnerUserId" = YOUR_USER_ID_HERE
--     ORDER BY a2."CreatedAt" DESC
--     LIMIT 1
-- )