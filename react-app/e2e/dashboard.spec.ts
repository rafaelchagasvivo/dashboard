import { test, expect } from '@playwright/test';
import path from 'path';

test('Dashboard loads correctly', async ({ page }) => {
    // Construct absolute path to the generated HTML file
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const filePath = path.resolve(__dirname, '../../dashboard-vivo-v2.html');
    const fileUrl = `file://${filePath}`;

    console.log(`Navigating to: ${fileUrl}`);
    await page.goto(fileUrl);

    // Check Title
    await expect(page).toHaveTitle(/Vivo Dashboard/i);

    // Check Header Elements
    await expect(page.getByText('Project Analytics Pro')).toBeVisible();

    // Check Upload Zone
    await expect(page.getByText('Arraste seus arquivos Excel')).toBeVisible();
    await expect(page.getByText('Suporta múltiplos arquivos')).toBeVisible();

    // Check Theme Switcher presence
    const themeSwitcher = page.locator('.flex.bg-card-bg.rounded-full');
    await expect(themeSwitcher).toBeVisible();

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'dashboard-verify.png', fullPage: true });
});
