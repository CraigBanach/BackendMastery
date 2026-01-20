import fs from "fs";
import path from "path";
import { chromium, FullConfig } from "@playwright/test";
import { resetDatabase } from "./tests/db-setup";

const authFile = path.resolve(__dirname, ".auth", "state.json");

async function globalSetup(config: FullConfig) {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await resetDatabase();

  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Try it with your partner" }).first().click();
  await page.waitForURL(/localhost:4001/);

  await page.getByLabel("Username").fill("testuser");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL(
    /localhost:3000\/(onboarding|budget|transactions|categories|dashboard)/
  );

  await context.storageState({ path: authFile });
  await browser.close();
}

export default globalSetup;

