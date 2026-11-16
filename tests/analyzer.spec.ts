import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#analyzer');
});

const day = (page: Page, n: number) => page.getByRole('button', { name: new RegExp(`^Day ${n}:`) });
const pickSuite = (page: Page, name: string) => page.getByText(name, { exact: true }).click();
const feedback = (page: Page) => page.locator('#guess-feedback');

test('says the data is synthetic and names no employer', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Runtime analyzer');
  await expect(page.getByText('All data here is synthetic')).toBeVisible();
  await expect(page.locator('#page-analyzer')).not.toContainText(/workday/i);
});

test('charts 30 days for the selected suite', async ({ page }) => {
  await expect(page.getByRole('radio', { name: 'checkout' })).toBeChecked();
  await expect(page.locator('#chart-title')).toHaveText(/^checkout:/);
  await expect(page.locator('#chart .pt')).toHaveCount(30);
  await pickSuite(page, 'payments');
  await expect(page.locator('#chart-title')).toHaveText(/^payments:/);
});

test('a healthy suite says so', async ({ page }) => {
  await day(page, 12).click();
  await expect(feedback(page)).toHaveText('checkout looks healthy: its runtime is flat. Try another suite.');
  await expect(page.locator('#reveal')).toBeHidden();
});

test('a one-off spike is not the regression', async ({ page }) => {
  await pickSuite(page, 'search');
  await day(page, 9).click();
  await expect(feedback(page)).toContainText('Day 9 is a one-off spike');
  await expect(page.locator('#reveal')).toBeHidden();
});

test('the wrong day on the regressed suite gets a hint', async ({ page }) => {
  await pickSuite(page, 'payments');
  await day(page, 5).click();
  await expect(feedback(page)).toHaveText('Not quite. Look for where the line steps up and stays up.');
  await expect(page.locator('#reveal')).toBeHidden();
});

test('finding the regression reveals the culprit', async ({ page }) => {
  await pickSuite(page, 'payments');
  await day(page, 18).click();
  await expect(feedback(page)).toContainText('Found it: payments stepped up on day 18, +4.2 min');
  await expect(page.locator('#chart .regressed')).toHaveCount(1);
  const reveal = page.locator('#reveal');
  await expect(reveal).toBeVisible();
  await expect(reveal.getByRole('rowheader', { name: 'refund flow' })).toBeVisible();
  await expect(reveal).toContainText('fixture: create users per test');
});

test('days can be picked from the keyboard', async ({ page, isMobile }) => {
  test.skip(isMobile, 'no hardware keyboard on mobile');
  await pickSuite(page, 'payments');
  await day(page, 1).focus();
  await page.keyboard.press('End');
  await expect(day(page, 30)).toBeFocused();
  for (let i = 0; i < 12; i++) await page.keyboard.press('ArrowLeft');
  await expect(day(page, 18)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#reveal')).toBeVisible();
  await expect(day(page, 18)).toBeFocused();
});

test('home and projects link to the demo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try a mini version →' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Runtime analyzer');
  await page.goto('/#projects');
  await page.getByRole('link', { name: 'Try it' }).click();
  await expect(page).toHaveURL(/#analyzer$/);
});

test('page never scrolls horizontally', async ({ page }) => {
  await pickSuite(page, 'payments');
  await day(page, 18).click();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
