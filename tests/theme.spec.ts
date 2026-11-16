import { test, expect } from '@playwright/test';

test.use({ colorScheme: 'light' });

test('theme toggle switches to dark and survives a reload', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('html');
  await expect(root).not.toHaveAttribute('data-theme', /.+/);

  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(root).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(root).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(root).toHaveAttribute('data-theme', 'light');
});
