import { test, expect } from '@playwright/test';

const nav = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: 'Main' });

test('nav link switches to the lab notebook', async ({ page }) => {
  await page.goto('/');
  await nav(page).getByRole('link', { name: 'Lab notebook' }).click();

  await expect(page).toHaveURL(/#lab$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lab notebook');
  await expect(nav(page).getByRole('link', { name: 'Lab notebook' })).toHaveAttribute('aria-current', 'page');
  await expect(nav(page).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current', 'page');
});

test('deep link opens the right page', async ({ page }) => {
  await page.goto('/#lab');
  await expect(page.getByRole('heading', { name: 'Chili crisp' })).toBeVisible();
  await expect(page.getByText('I build tools that make engineering teams faster.')).toBeHidden();
});

test('unknown hash falls back to home', async ({ page }) => {
  await page.goto('/#does-not-exist');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'I build tools that make engineering teams faster.',
  );
});

test('browser back returns to the previous page', async ({ page }) => {
  await page.goto('/');
  await nav(page).getByRole('link', { name: 'Lab notebook' }).click();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Career pipeline' })).toBeVisible();
});
