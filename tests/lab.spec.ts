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

test('Enchantments hike is listed as completed, the rest as ongoing', async ({ page }) => {
  const completed = page.locator('h2:text-is("Completed") + .teasers .card');
  await expect(completed).toHaveCount(1);
  await expect(completed).toContainText('The Enchantments in a day');
  await expect(completed).toContainText('completed Aug 20, 2025');
  await expect(completed.getByRole('link', { name: 'the Enchantments' })).toHaveAttribute(
    'href',
    'https://www.wta.org/go-hiking/hikes/enchantment-lakes',
  );

  const ongoing = page.locator('h2:text-is("Ongoing") + .teasers .card');
  await expect(ongoing).toHaveCount(2);
  await expect(ongoing.locator('.status')).toHaveText(['ongoing', 'ongoing']);
  await expect(page.getByText('planned', { exact: true })).toHaveCount(0);
});
