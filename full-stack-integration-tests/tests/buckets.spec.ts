import { test, expect, Page } from "@playwright/test";
import path from "path";

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


test("user can create, edit, and delete a bucket", async ({ page }, testInfo) => {
  const bucketName = `Holiday Fund ${testInfo.project.name}`;
  const updatedBucketName = `${bucketName} Updated`;

  await page.goto("/buckets");
  await ensureAccount(page);
  await page.goto("/buckets");
  await expect(page.getByRole("heading", { name: "Buckets" })).toBeVisible();

  await page.getByRole("button", { name: "Add Bucket" }).click();
  await page.getByLabel("Bucket Name").fill(bucketName);
  await page.getByLabel("Target Amount (Optional)").fill("250");
  await page.getByLabel("Current Balance").fill("75");
  await page.getByRole("button", { name: "Create Bucket" }).click();

  const createDialog = page.getByRole("dialog", { name: "Create Bucket" });
  await expect(createDialog).toBeHidden({ timeout: 15000 });

  await expect(page.getByRole("cell", { name: bucketName })).toBeVisible();
  const createdRow = page.getByRole("row", { name: new RegExp(bucketName) });
  await expect(createdRow).toBeVisible();
  await expect(createdRow.getByText("£75.00")).toBeVisible();
  await expect(createdRow.getByText("£250.00")).toBeVisible();

  const editButton = createdRow.getByRole("button", { name: "Edit bucket" });
  await expect(editButton).toBeEnabled({ timeout: 15000 });
  await editButton.click();

  await expect(
    page.getByRole("button", { name: "Update Bucket" })
  ).toBeVisible();
  const nameInput = page.getByLabel("Bucket Name");
  await nameInput.click();
  await nameInput.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await nameInput.press("Backspace");
  await nameInput.type(updatedBucketName);

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

  await expect(page.getByRole("cell", { name: updatedBucketName })).toBeVisible();
  const updatedRow = page.getByRole("row", { name: new RegExp(updatedBucketName) });
  await expect(updatedRow).toBeVisible();
  await expect(updatedRow.getByText("£125.00")).toBeVisible();
  await expect(updatedRow.getByText("£500.00")).toBeVisible();

  await updatedRow.getByRole("button", { name: "Delete bucket" }).click();
  const deleteModal = page.getByRole("dialog", { name: "Delete Bucket" });
  await expect(deleteModal).toBeVisible();
  await deleteModal.getByRole("button", { name: "Delete Bucket" }).click();
  await expect(deleteModal).toBeHidden({ timeout: 15000 });

  await expect(
    page.getByRole("row", { name: new RegExp(updatedBucketName) }).first()
  ).toBeHidden({ timeout: 30000 });

});

