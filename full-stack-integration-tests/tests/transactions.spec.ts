import { expect, test, Page } from "@playwright/test";
import path from "path";
import { resetDatabase } from "./db-setup";

const authFile = path.resolve(__dirname, "..", ".auth", "state.json");

test.use({ storageState: authFile });

test.beforeAll(async () => {
  await resetDatabase();
});

async function openTransactionsPage(page: Page) {
  await page.goto("/transactions");
  await page.waitForURL(/\/transactions/);
  await expect(page.getByRole("heading", { name: "Transactions" })).toBeVisible();
}

async function fillTransactionModal(page: Page, values: {
  amount: string;
  description: string;
  categorySearch: string;
  categoryName: string;
  notes?: string;
}) {
  const modal = page.getByRole("dialog", { name: "Add Transaction" });
  await expect(modal).toBeVisible();
  const amountInput = modal.getByPlaceholder("0.00");
  await amountInput.waitFor({ state: "visible" });

  await amountInput.fill(values.amount);
  await modal.getByLabel("Description").fill(values.description);
  await modal.getByRole("combobox", { name: "Category" }).click();
  await page.getByRole("combobox", { name: "Search category" }).fill(values.categorySearch);
  await page
    .getByRole("listbox", { name: "Suggestions" })
    .getByRole("option", { name: new RegExp(values.categoryName) })
    .click();

  if (values.notes) {
    await modal.getByLabel("Notes (Optional)").fill(values.notes);
  }
}

async function replaceInputValue(input: ReturnType<Page["getByLabel"]>, value: string) {
  await input.click();
  await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await input.press("Backspace");
  await input.type(value);
}

test("user can create, edit, filter, and delete transactions", async ({ page }) => {
  await openTransactionsPage(page);

  await page.getByRole("button", { name: "Add Transaction" }).click();
  await fillTransactionModal(page, {
    amount: "45.25",
    description: "Weekly groceries",
    categorySearch: "Food",
    categoryName: "Food Shopping",
    notes: "Weekly shop for the house",
  });
  await page.getByRole("dialog", { name: "Add Transaction" }).getByRole("button", { name: "Add Transaction" }).click();
  await page.getByRole("dialog", { name: "Add Transaction" }).waitFor({ state: "hidden" });

  const transactionSummary = page.getByText("Weekly groceries");
  await expect(transactionSummary).toBeVisible();
  await expect(page.getByTestId("transaction-amount")).toContainText("£45.25");
  await expect(page.getByText("Weekly shop for the house")).toBeVisible();
  await expect(page.getByTestId("transaction-category").first()).toContainText(
    "Food Shopping"
  );

  await page.getByRole("button", { name: "Add Transaction" }).click();
  await fillTransactionModal(page, {
    amount: "1200",
    description: "Monthly rent",
    categorySearch: "Rent",
    categoryName: "Rent/Mortgage",
  });
  await page.getByRole("dialog", { name: "Add Transaction" }).getByRole("button", { name: "Add Transaction" }).click();
  await page.getByRole("dialog", { name: "Add Transaction" }).waitFor({ state: "hidden" });

  const rentAmount = page
    .getByText("Monthly rent")
    .locator("../..")
    .getByTestId("transaction-amount");
  await expect(page.getByText("Monthly rent")).toBeVisible();
  await expect(rentAmount).toContainText("£1,200.00");

  const groceriesRow = page
    .getByTestId("transaction-row")
    .filter({ hasText: "Weekly groceries" });

  await groceriesRow.getByTestId("transaction-edit").click();

  const editForm = page.getByTestId("transaction-edit-form");
  await expect(editForm).toBeVisible();

  await editForm
    .getByTestId("transaction-edit-description")
    .fill("Weekly groceries updated");
  await editForm
    .getByTestId("transaction-edit-amount")
    .fill("60.00");

  await editForm.locator("[data-slot='select-trigger']").click();
  await page.getByRole("option", { name: /Eating Out/ }).click();

  await editForm
    .getByTestId("transaction-edit-notes")
    .fill("Takeaway night");

  await editForm.getByRole("button", { name: "Save" }).click();

  const updatedRow = page
    .locator("[data-testid='transaction-row']:visible")
    .filter({ hasText: "Weekly groceries updated" });
  await expect(updatedRow).toBeVisible();
  await expect(updatedRow.getByTestId("transaction-amount")).toContainText(
    "£60.00"
  );
  await expect(
    updatedRow.getByTestId("transaction-category").first()
  ).toContainText("Eating Out");
  await expect(updatedRow).toContainText("Takeaway night");

  await page.getByRole("combobox", { name: "Filter by category" }).click();
  await page.getByRole("option", { name: /Eating Out/ }).click();
  await expect(page.getByText("Monthly rent")).not.toBeVisible();
  await expect(page.getByText("Weekly groceries updated")).toBeVisible();

  await page.getByRole("button", { name: "Clear Filter" }).click();
  await expect(page.getByText("Monthly rent")).toBeVisible();

  const updatedRowToDelete = page
    .getByTestId("transaction-row")
    .filter({ hasText: "Weekly groceries updated" })
    .first();

  page.once("dialog", (dialog) => dialog.accept());
  await updatedRowToDelete.getByTestId("transaction-delete").click();
  await expect(page.getByText("Weekly groceries updated")).not.toBeVisible();

  const rentRowToDelete = page
    .getByTestId("transaction-row")
    .filter({ hasText: "Monthly rent" })
    .first();

  page.once("dialog", (dialog) => dialog.accept());
  await rentRowToDelete.getByTestId("transaction-delete").click();
  await expect(page.getByText("Monthly rent")).not.toBeVisible();
  await expect(
    page.getByRole("main").getByText("No transactions found for this month.").first()
  ).toBeVisible();
});
