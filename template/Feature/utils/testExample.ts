import { expect, Page } from '@playwright/test';

export async function testExample(page: Page): Promise<void> {
  
  await page.getByText('J', { exact: true }).click();
  await expect(page.getByText('J', { exact: true })).toBeVisible();
  
}