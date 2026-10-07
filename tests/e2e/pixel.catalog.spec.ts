import { expect, test } from "@playwright/test";
import { expectHomeChrome, openFresh, startGame } from "./helpers.ts";

test("home loads with version, how-to, and best times", async ({ page }) => {
  await openFresh(page);
  await expectHomeChrome(page);
});

test("start opens a board with version and best on the HUD", async ({ page }) => {
  await openFresh(page);
  await startGame(page);
});

test("pixel portrait keeps version, how-to, start, and best on screen", async ({ page }) => {
  await openFresh(page);
  const viewport = page.viewportSize();
  expect(viewport).toEqual({ width: 412, height: 915 });

  for (const id of ["version", "howto", "start", "best-easy", "best-medium", "best-hard"]) {
    const box = await page.getByTestId(id).boundingBox();
    expect(box, id).toBeTruthy();
    expect(box!.y, `${id} top`).toBeGreaterThanOrEqual(-1);
    expect(box!.y + box!.height, `${id} bottom`).toBeLessThanOrEqual(viewport!.height + 1);
    expect(box!.x, `${id} left`).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width, `${id} right`).toBeLessThanOrEqual(viewport!.width + 1);
  }
});
