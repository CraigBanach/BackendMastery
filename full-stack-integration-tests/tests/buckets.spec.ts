import { test, expect, Page } from "@playwright/test";
import path from "path";
import { resetDatabase } from "./db-setup";

const authFile = path.resolve(__dirname, "..", ".auth", "state.json");

async function ensureAccount(page: Page) {
  await page.waitForURL(/\/buckets|\/onboarding/);
  if (!page.url().includes("/onboarding")) {
    return;
  }

  await page.locator("text=Create New Account").click();
  await page.fill('input[name="accountName"]', "My Family Finances");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/localhost:3000\/(dashboard|budget|transactions|categories)/);
}

test.use({ storageState: authFile });

test.beforeAll(async () => {
  await resetDatabase();
});

test("user can create, edit, and delete a bucket", async ({ page }) => {
  await page.goto("/buckets");
  await ensureAccount(page);
  await page.goto("/buckets");
  await expect(page.getByRole("heading", { name: "Buckets" })).toBeVisible();

  await page.getByRole("button", { name: "Add Bucket" }).click();
  await page.getByLabel("Bucket Name").fill("Holiday Fund");
  await page.getByLabel("Target Amount (Optional)").fill("250");
  await page.getByLabel("Current Balance").fill("75");
  await page.getByRole("button", { name: "Create Bucket" }).click();

  await expect(page.getByRole("cell", { name: "Holiday Fund" })).toBeVisible();
  const createdRow = page.getByRole("row", { name: /Holiday Fund/ });
  await expect(createdRow).toBeVisible();
  await expect(createdRow.getByText("£75.00")).toBeVisible();
  await expect(createdRow.getByText("£250.00")).toBeVisible();

  await page.getByRole("button", { name: "Edit bucket" }).click();
  await expect(
    page.getByRole("button", { name: "Update Bucket" })
  ).toBeVisible();
  const nameInput = page.getByLabel("Bucket Name");
  await nameInput.click();
  await nameInput.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await nameInput.press("Backspace");
  await nameInput.type("Holiday Fund Updated");

  const targetInput = page.getByLabel("Target Amount (Optional)");
  await targetInput.click();
  await targetInput.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await targetInput.press("Backspace");
  await targetInput.type("500");

  const balanceInput = page.getByLabel("Current Balance");
  await balanceInput.click();
  await balanceInput.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await balanceInput.press("Backspace");
  await balanceInput.type("125");
  await page.getByRole("button", { name: "Update Bucket" }).click();

  await expect(page.getByRole("cell", { name: "Holiday Fund Updated" })).toBeVisible();
  const updatedRow = page.getByRole("row", { name: /Holiday Fund Updated/ });
  await expect(updatedRow).toBeVisible();
  await expect(updatedRow.getByText("£125.00")).toBeVisible();
  await expect(updatedRow.getByText("£500.00")).toBeVisible();

  await page.getByRole("button", { name: "Delete bucket" }).click();
  const deleteModal = page.getByRole("dialog", { name: "Delete Bucket" });
  await expect(deleteModal).toBeVisible();
  await deleteModal.getByRole("button", { name: "Delete Bucket" }).click();

  await expect(page.getByText("No buckets found. Create your first savings bucket to get started.")).toBeVisible();
});
