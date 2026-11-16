import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    for (const path of ['/', '/#lab']) {
      test(`no WCAG A/AA violations on ${path}`, async ({ page }) => {
        await page.goto(path);
        // Open every pipeline stage so hidden details get scanned too.
        for (const btn of await page.locator('.stage button:visible').all()) await btn.click();

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
        expect(results.violations.map(v => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
      });
    }
  });
}
