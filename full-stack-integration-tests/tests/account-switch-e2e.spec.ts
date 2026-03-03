import { test, expect, Page, BrowserContext } from "@playwright/test";
import {
  createInvitationToken,
  getUserAndAccountIds,
  verifyUserAccount,
  isAccountArchived,
} from "./db-setup";

/**
 * End-to-end test for the complete account switching flow.
 * This test uses two different user sessions to test:
 * 1. User A generates an invitation token
 * 2. User B uses the token to switch to User A's account
 * 3. User B's old account is archived
 */
test.describe("Account Switch E2E Flow", () => {
  let userAContext: BrowserContext;
  let userBContext: BrowserContext;
  let userAPage: Page;
  let userBPage: Page;

  test.beforeAll(async ({ browser }) => {
    // Create two separate browser contexts for two users
    userAContext = await browser.newContext({ ignoreHTTPSErrors: true });
    userBContext = await browser.newContext({ ignoreHTTPSErrors: true });

    userAPage = await userAContext.newPage();
    userBPage = await userBContext.newPage();

    // Login User A (testuser - has existing account "Test Household")
    await loginUser(userAPage, "testuser", "Password123!");

    // Login User B (newuser - will get auto-created account "My Account")
    await loginUser(userBPage, "newuser", "Password123!");
  });

  test.afterAll(async () => {
    await userAContext?.close();
    await userBContext?.close();
  });

  async function loginUser(page: Page, username: string, password: string) {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Try it with your partner" }).first().click();
    await page.waitForURL(/localhost:4001/);
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/localhost:3000\/budget/);
  }

  test("User B can switch to User A's account using invitation token", async () => {
    // Step 1: User A generates an invitation token
    await userAPage.locator("text=Profile").click();
    await userAPage.getByRole("option", { name: "Invite Partner" }).click();

    const inviteModal = userAPage.getByRole("dialog", { name: /Invite/i });
    await expect(inviteModal).toBeVisible();

    // Wait for token to be generated and get the value
    const tokenInput = inviteModal.getByLabel(/Invite Token/i);
    await expect(tokenInput).toBeVisible();
    const invitationToken = await tokenInput.inputValue();
    expect(invitationToken.length).toBeGreaterThan(10);

    // Close the invite modal
    await inviteModal.getByRole("button", { name: "Done" }).click();

    // Step 2: Get User B's current account ID (to verify it gets archived later)
    const userBBefore = await getUserAndAccountIds("new-user-sub");
    const userBOldAccountId = userBBefore.accountId;
    expect(userBOldAccountId).not.toBeNull();

    // Verify User B currently has "My Account"
    const hasMyAccount = await verifyUserAccount("new-user-sub", "My Account");
    expect(hasMyAccount).toBe(true);

    // Step 3: User B opens Switch Account dialog
    await userBPage.locator("text=Profile").click();
    await userBPage.getByRole("option", { name: "Switch Account" }).click();

    const switchDialog = userBPage.getByRole("dialog", { name: "Switch Account" });
    await expect(switchDialog).toBeVisible();

    // Step 4: User B enters the invitation token
    await switchDialog.getByLabel(/Invitation Token or Link/i).fill(invitationToken);
    await switchDialog.getByRole("button", { name: /Continue/i }).click();

    // Step 5: Confirmation screen should appear
    await expect(switchDialog.getByText("Test Household")).toBeVisible(); // Target account name
    await expect(switchDialog.getByText("test@example.com")).toBeVisible(); // Inviter email
    await expect(switchDialog.getByText(/Warning.*replace/i)).toBeVisible(); // Warning message

    // Step 6: User B confirms the switch
    await switchDialog.getByRole("button", { name: "Switch Account" }).click();

    // Step 7: Success message should appear
    await expect(switchDialog.getByText(/Successfully switched/i)).toBeVisible();

    // Step 8: Click Continue to reload the page
    await switchDialog.getByRole("button", { name: "Continue" }).click();

    // Page should reload and show the new account's data
    await userBPage.waitForURL(/localhost:3000\/budget/);

    // Step 9: Verify in database that User B now has User A's account
    const hasTestHousehold = await verifyUserAccount("new-user-sub", "Test Household");
    expect(hasTestHousehold).toBe(true);

    // Step 10: Verify User B's old account is archived
    const oldAccountArchived = await isAccountArchived(userBOldAccountId!);
    expect(oldAccountArchived).toBe(true);
  });
});

/**
 * Standalone test for verifying the "already member" check.
 * This doesn't require two user sessions.
 */
test.describe("Already Member Validation", () => {
  test("user cannot join account they already belong to", async ({ page }) => {
    // Login as testuser who owns "Test Household"
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Try it with your partner" }).first().click();
    await page.waitForURL(/localhost:4001/);
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/localhost:3000\/budget/);

    // Generate an invitation token for own account
    await page.locator("text=Profile").click();
    await page.getByRole("option", { name: "Invite Partner" }).click();

    const inviteModal = page.getByRole("dialog", { name: /Invite/i });
    const tokenInput = inviteModal.getByLabel(/Invite Token/i);
    await expect(tokenInput).toBeVisible();
    const ownToken = await tokenInput.inputValue();

    await inviteModal.getByRole("button", { name: "Done" }).click();

    // Try to use the token on own account
    await page.locator("text=Profile").click();
    await page.getByRole("option", { name: "Switch Account" }).click();

    const switchDialog = page.getByRole("dialog", { name: "Switch Account" });
    await switchDialog.getByLabel(/Invitation Token or Link/i).fill(ownToken);
    await switchDialog.getByRole("button", { name: /Continue/i }).click();

    // Should show "already member" error
    await expect(switchDialog.getByText(/already a member/i)).toBeVisible();
  });
});
