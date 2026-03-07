import { test, expect } from "@playwright/test";
import { verifyUserAccount, countAccountCategories, getUserAndAccountIds } from "./db-setup";

test.describe.configure({ mode: "serial" });

test.describe("Auto Account Creation", () => {
  test("new user gets account auto-created and lands on budget page", async ({ page }) => {
    // Navigate to the base URL
    await page.goto("/");

    // Click login button
    await page.getByRole("link", { name: "Try it with your partner" }).first().click();

    // Should redirect to OIDC mock server's login page
    await expect(page).toHaveURL(/localhost:4001/);

    // Fill in credentials for a new user (no existing account)
    await page.getByLabel("Username").fill("newuser");
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Login" }).click();

    // With auto-account creation, user should go directly to /budget (NOT /onboarding)
    await expect(page).toHaveURL(/localhost:3000\/budget/);

    // Verify the Budget Overview page is displayed
    await expect(page.getByRole("heading", { name: "Budget Overview" })).toBeVisible();

    // Verify default categories are visible (auto-created with account)
    // These appear in the Income and Expenses sections once budget data loads
    // Wait for the desktop table rows (visible on md+ screens) containing category names
    await expect(page.locator("table").getByText("Food Shopping")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("table").getByText("Salary")).toBeVisible({ timeout: 15000 });

    // Verify in database that account was created with correct name
    const hasAccount = await verifyUserAccount("new-user-sub", "My Account");
    expect(hasAccount).toBe(true);

    // Verify default categories were created
    const { accountId } = await getUserAndAccountIds("new-user-sub");
    const categoryCount = await countAccountCategories(accountId!);
    expect(categoryCount).toBe(10);

    // Clean up - logout
    await page.locator("text=Profile").click();
    await page.locator("text=Logout").click();
    await expect(page).toHaveURL(/localhost:4001/);
  });

  test("onboarding page returns 404", async ({ page }) => {
    // Try to navigate directly to the old onboarding page
    const response = await page.goto("/onboarding");

    // Should return 404
    expect(response?.status()).toBe(404);
  });
});
