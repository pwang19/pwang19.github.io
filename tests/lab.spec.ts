import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#lab');
});

test('chili crisp credits its source', async ({ page }) => {
  await expect(page.getByText("I used Sohla El-Waylly's recipe on Serious Eats")).toBeVisible();
});

test('original branch is selected by default with no diff', async ({ page }) => {
  await expect(page.getByRole('radio', { name: 'main' })).toBeChecked();
  await expect(page.locator('#branch-title')).toHaveText('The original');
  await expect(page.locator('#branch-diff')).toBeHidden();
});

const variants = [
  { branch: 'nut-free', title: 'Nut-free', diff: ['- peanuts'] },
  { branch: 'extra-spicy', title: 'Extra spicy', diff: ['+ more heat'] },
  { branch: 'mild-mala', title: 'Mild and more mala', diff: ['- heat', '+ mala'] },
];

for (const v of variants) {
  test(`selecting ${v.branch} shows its diff`, async ({ page }) => {
    await page.getByText(v.branch, { exact: true }).click();
    await expect(page.getByRole('radio', { name: v.branch })).toBeChecked();
    await expect(page.locator('#branch-title')).toHaveText(v.title);
    await expect(page.locator('#branch-diff li')).toHaveText(v.diff);
  });
}

test('branches can be switched with arrow keys', async ({ page, isMobile }) => {
  test.skip(isMobile, 'no hardware keyboard on mobile');
  await page.getByRole('radio', { name: 'main' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'nut-free' })).toBeChecked();
  await expect(page.locator('#branch-title')).toHaveText('Nut-free');
});

test('chili crisp links to the Serious Eats recipe', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'recipe on Serious Eats' })).toHaveAttribute(
    'href',
    'https://www.seriouseats.com/homemade-spicy-chili-crisp',
  );
});

test('entries are grouped by theme, each with its status', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Kitchen', 'Workshop', 'Outdoors']);

  const hike = page.getByRole('article').filter({ hasText: 'The Enchantments in a day' });
  await expect(hike.locator('.status')).toHaveText('completed Aug 20, 2025');
  await expect(hike.getByRole('link', { name: 'the Enchantments' })).toHaveAttribute(
    'href',
    'https://www.wta.org/go-hiking/hikes/enchantment-lakes',
  );

  for (const name of ['The dinner table', '3D printing']) {
    await expect(page.getByRole('article').filter({ hasText: name }).locator('.status')).toHaveText('ongoing');
  }
});
