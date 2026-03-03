import { expect, test } from "@playwright/test";
import path from "path";

const authFile = path.resolve(__dirname, "..", ".auth", "state.json");

test.use({ storageState: authFile });

test("budget modal blocks negative amounts and allows zero", async ({ page }) => {
  await page.goto("/budget");

  await expect(page.getByRole("heading", { name: "Budget Overview" })).toBeVisible();

  await page.getByRole("button", { name: "Edit Budgets" }).click();

  const modal = page.getByRole("dialog", { name: /Edit Budget/ });
  const foodShoppingInput = modal.getByLabel("Food Shopping");
  const saveButton = modal.getByRole("button", { name: "Save Budget" });

  await foodShoppingInput.fill("-1");
  await expect(modal.getByText("Budget amounts must be zero or greater.")).toBeVisible();
  await expect(saveButton).toBeDisabled();

  await foodShoppingInput.fill("0");
  await expect(saveButton).toBeEnabled();
  await saveButton.click();


  await expect(saveButton).toBeHidden();

  const foodRow = page.getByRole("row", { name: /Food Shopping/ });
  await expect(foodRow.locator("text=£0.00").first()).toBeVisible();

});
