import { chromium, firefox, webkit, expect, Browser, BrowserContext, Page } from '@playwright/test';
import 'dotenv/config';

export async function testLogin(browserName: 'chromium' | 'firefox' | 'webkit' = 'chromium'): Promise<{ browser: Browser, context: BrowserContext, page: Page }> {
  let browser: Browser;

  if (browserName === 'firefox') {
    browser = await firefox.launch({ headless: false });
  } else if (browserName === 'webkit') {
    browser = await webkit.launch({ headless: false });
  } else {
    browser = await chromium.launch({ headless: false });
  }
  const context = await browser.newContext({ locale: 'es-ES' });
  const page = await context.newPage();
  await page.goto('https://auraview.auravant.com/login');

  // Click en un elemento
  await page.getByRole('img', { name: 'logo auravant' }).click();
  await expect(page.getByRole('img', { name: 'logo auravant' })).toBeVisible();

  // Variables para los campos de email y contraseña
  const email = process.env.USER_EMAIL || '';
  const password = process.env.USER_PASSWORD || '';
  const emailInput = page.getByRole('textbox', { name: 'Ingresar email...' });
  const passwordInput = page.getByRole('textbox', { name: 'Ingresar contraseña' });
  const loginButton = page.getByRole('button', { name: 'Entrar' });

  // Completar los campos de email y contraseña
  await emailInput.click();
  await emailInput.fill(email);
  await passwordInput.click();
  await passwordInput.fill(password);

  // Verificar que los campos tienen los valores correctos
  await expect(emailInput).toHaveValue(email);
  await expect(passwordInput).toHaveValue(password);

  // Click en el botón de entrar
  await loginButton.click();

  // Verificar que el logo de usuario es visible en la esquina superior derecha después del login
  await page.getByText('J', { exact: true }).click();
  await expect(page.getByText('J', { exact: true })).toBeVisible();

  // Retorna browser, context y page para seguir usando la sesión
  return { browser, context, page };
}
