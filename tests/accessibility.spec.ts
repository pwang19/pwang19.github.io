import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    for (const path of ['/', '/#projects', '/#lab', '/#analyzer']) {
      test(`no WCAG A/AA violations on ${path}`, async ({ page }) => {
        await page.goto(path);
        // Open every pipeline stage so hidden details get scanned too.
        for (const btn of await page.locator('.stage button:visible').all()) await btn.click();
        // Solve the analyzer demo so its revealed results get scanned too.
        if (path === '/#analyzer') {
          await page.getByText('payments', { exact: true }).click();
          await page.getByRole('button', { name: /^Day 18:/ }).click();
        }

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
        expect(results.violations.map(v => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
      });
    }
  });
}
