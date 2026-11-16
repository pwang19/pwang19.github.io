import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#lab');
});

test('chili crisp changelog lists versions newest first', async ({ page }) => {
  const versions = await page.locator('.changelog .ver').allTextContents();
  expect(versions[0]).toBe('v3.2');
  expect(versions.at(-1)).toBe('v1.0');
});

test('heat slider updates the readout', async ({ page }) => {
  const slider = page.getByLabel('Heat level');
  await expect(slider).toHaveValue('3');
  await expect(page.locator('#heat-note')).toHaveText(/House batch/);

  await slider.fill('1');
  await expect(page.locator('#heat-note')).toHaveText(/Mild/);

  await slider.fill('5');
  await expect(page.locator('#heat-readout')).toHaveText('🌶️🌶️🌶️🌶️🌶️');
  await expect(page.locator('#heat-note')).toHaveText(/Release candidate/);
});
