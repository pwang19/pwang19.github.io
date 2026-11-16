import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('shows the headline and primary links', async ({ page }) => {
  await expect(page).toHaveTitle('Peter Wang');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'I build tools that make engineering teams faster.',
  );
  await expect(page.getByRole('link', { name: 'Résumé (PDF)' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/pwang19',
  );
});

test('pipeline stage expands and collapses on click', async ({ page }) => {
  const stage = page.getByRole('button', { name: /Automate: Senior Associate Automation Engineer/ });
  const detail = page.getByText('Wrote the migration guide 2 peer engineers used');

  await expect(stage).toHaveAttribute('aria-expanded', 'false');
  await expect(detail).toBeHidden();

  await stage.click();
  await expect(stage).toHaveAttribute('aria-expanded', 'true');
  await expect(detail).toBeVisible();

  await stage.click();
  await expect(stage).toHaveAttribute('aria-expanded', 'false');
  await expect(detail).toBeHidden();
});

test('pipeline stage opens from the keyboard', async ({ page, isMobile }) => {
  test.skip(isMobile, 'no hardware keyboard on mobile');
  const stage = page.getByRole('button', { name: /Deploy: what's next/ });
  await stage.focus();
  await page.keyboard.press('Enter');
  await expect(stage).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('link', { name: 'saucedemo-playwright' })).toBeVisible();
});

test('page never scrolls horizontally', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
