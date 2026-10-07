import { expect, type Page } from "@playwright/test";

export const VERSION_TEXT = /v\d+\.\d+\.\d+/;

/** Fresh visit: drop any saved path or best times before the app boots. */
export async function openFresh(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("start-screen")).toBeVisible();
}

export async function expectHomeChrome(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Zip", level: 1 })).toBeVisible();
  await expect(page.getByTestId("version")).toHaveText(VERSION_TEXT);
  await expect(page.getByTestId("howto")).toBeVisible();
  await expect(page.getByTestId("howto").locator("li")).toHaveCount(4);
  await expect(page.getByTestId("start")).toBeEnabled();
  await expect(page.getByTestId("play-screen")).toHaveCount(0);

  for (const id of ["best-easy", "best-medium", "best-hard"]) {
    const chip = page.getByTestId(id);
    await expect(chip).toBeVisible();
    await expect(chip).toContainText(/BEST (Easy|Medium|Hard)/);
    await expect(chip).toContainText(/—|\d+:\d{2}/);
  }
}

export async function startGame(page: Page): Promise<void> {
  await page.getByTestId("start").click();
  await expect(page.getByTestId("play-screen")).toBeVisible();
  await expect(page.getByTestId("board")).toBeVisible();
  await expect(page.getByTestId("version")).toHaveText(VERSION_TEXT);
  await expect(page.getByTestId("hud")).toBeVisible();
  await expect(page.getByTestId("best")).toContainText("BEST");
  await expect(page.getByTestId("start-screen")).toHaveCount(0);
}
