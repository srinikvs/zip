import { expect, test } from "@playwright/test";
import { expectHomeChrome, openFresh, startGame } from "./helpers.ts";

test("desktop smoke: how-to and start begin a playable board", async ({ page }) => {
  await openFresh(page);
  expect(page.viewportSize()).toEqual({ width: 1280, height: 800 });
  await expectHomeChrome(page);
  await startGame(page);
});
