import { test, expect } from "@playwright/test";
import { resetDatabase } from "./db-setup";

test.beforeAll(async () => {
    await resetDatabase();
});

test("user can log in with valid credentials", async ({ page }) => {
  await page.goto("/"); // Navigate to the base URL (http://localhost:3000)

  // Assuming there's a login button or link on the homepage
  // You might need to adjust the selector based on your actual frontend UI
  await page.locator("text=Get Started Free").first().click(); // Adjust selector as needed

  // The page should redirect to the OIDC mock server's login page (http://localhost:4001)
  // Wait for the login form to appear
  await expect(page).toHaveURL(/localhost:4001/); // Verify redirection to OIDC mock server

  // Fill in the username and password for the test user
  await page.getByLabel("Username").fill("newuser");
  await page.getByLabel("Password").fill("Password123!");


  // Click the login button on the OIDC mock server's page
  await page.getByRole('button', { name: 'Login' }).click();

  // The page should redirect back to the application after successful login
  await expect(page).toHaveURL("http://localhost:3000/onboarding");

  await page.locator("text=Create New Account").click();
  await page.fill('input[name="accountName"]', "My Family Finances");
  await page.locator('button[type="submit"]').click();
  // Verify that the user is logged in

  // This depends on your application's UI after login.
  // Examples:
  // - Check for a "Welcome, Test User" text
  // - Check for a "Log Out" button
  // - Check for a dashboard element
  await page.locator("text=Profile").click(); // Adjust selector as needed
  await page.locator("text=Logout").click();

  await expect(page).toHaveURL(/localhost:4001/);
  // You can add more assertions here to check for user-specific content or a dashboard
  // await expect(page.locator('text=Welcome, Test User')).toBeVisible();
});
