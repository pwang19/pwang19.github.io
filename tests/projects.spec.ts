import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#projects');
});

const card = (page: import('@playwright/test').Page, name: string) =>
  page.getByRole('article').filter({ has: page.getByRole('heading', { name, exact: true }) });

test('lists each project', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');
  await expect(page.getByRole('heading', { level: 3 })).toHaveText([
    'ListApp',
    'Places',
    'saucedemo-playwright',
    'Runtime analyzer (demo)',
    'This site',
  ]);
});

test('ListApp links to the live app and its code', async ({ page }) => {
  const listapp = card(page, 'ListApp');
  await expect(listapp.getByRole('link', { name: 'Live' })).toHaveAttribute('href', 'https://listapp.pwang19.workers.dev');
  await expect(listapp.getByRole('link', { name: 'Code' })).toHaveAttribute('href', 'https://github.com/pwang19/listapp');
});

test('Places links only to its code, since the app is private', async ({ page }) => {
  const places = card(page, 'Places');
  await expect(places.getByRole('link')).toHaveCount(1);
  await expect(places.getByRole('link', { name: 'Code' })).toHaveAttribute('href', 'https://github.com/pwang19/places');
  await expect(places).toContainText('private to a group of friends');
});

test('home links through to all projects', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'All projects →' }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
});
