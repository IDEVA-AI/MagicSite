import { test, expect } from '@playwright/test';

test.describe('Functional Tests', () => {
    test('should load dashboard', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/.*dashboard/);
        await expect(page.getByText('Meus Projetos')).toBeVisible();
    });

    test('should have create project button', async ({ page }) => {
        await page.goto('/dashboard');
        const createButton = page.getByRole('link', { name: /Novo Projeto/i });
        await expect(createButton).toBeVisible();
        await createButton.click();
        await expect(page).toHaveURL(/.*\/create/);
    });
});
