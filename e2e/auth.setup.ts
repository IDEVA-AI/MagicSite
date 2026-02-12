import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
        console.warn('TEST_USER_EMAIL or TEST_USER_PASSWORD not set. Skipping auth setup.');
        return;
    }

    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard or success message
    await expect(page).toHaveURL(/.*dashboard/);

    await page.context().storageState({ path: authFile });
});
