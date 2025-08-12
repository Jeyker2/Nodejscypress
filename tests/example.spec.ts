import { test, expect } from '@playwright/test';

// Leemos parámetros desde la línea de comandos o usamos valores por defecto
// BROWSER=firefox URL=https://auraview.auravant.com/ npx playwright test
// npx playwright test --project=chromium

const urlBase = process.env.URL || 'https://auraview.auravant.com/';
const browserType = process.env.BROWSER || 'chromium';

// Test 1: Verificar título
test(`Abrir página principal en ${browserType}`, async ({ browser }) => {
  // Abrimos el navegador indicado
  const context = await browser.newContext({ locale: 'es-ES' });
  const page = await context.newPage();
  await page.goto(urlBase);

  // Ejemplo de verificación: título contiene 'Auravant'
  // await expect(page.locator('text=¡Bienvenido!')).toBeVisible();

  await context.close();
});

// Test 2: Verificar login
test(`Ir a login en ${browserType}`, async ({ browser }) => {
  const context = await browser.newContext({ locale: 'es-ES' });
  const page = await context.newPage();
  await page.goto(`${urlBase}login`);

  // Click en un elemento
  await page.getByRole('img', { name: 'logo auravant' }).click();

  // Verificar logo visible
  await expect(page.getByRole('img', { name: 'logo auravant' })).toBeVisible();

   // Variables para los campos de email y contraseña
  const emailInput = page.getByRole('textbox', { name: 'Ingresar email...' });
  const passwordInput = page.getByRole('textbox', { name: 'Ingresar contraseña' });
  const loginButton = page.getByRole('button', { name: 'Entrar' });

  // Completar los campos de email y contraseña
  await emailInput.click();
  await emailInput.fill('juarby.sanguino@auravant.com');
  await passwordInput.click();
  await passwordInput.fill('Nilson123');

  // Verificar que los campos tienen los valores correctos
  // await expect(emailInput).toBeVisible();
  await expect(emailInput).toHaveValue('juarby.sanguino@auravant.com');

  // await expect(passwordInput).toBeVisible();
  await expect(passwordInput).toHaveValue('Nilson123');

  // Click en el botón de entrar
  await loginButton.click();

  // Verificar que el logo de usuario es visible en la esquina superior derecha después del login
  await page.getByText('J', { exact: true }).click();
  await expect(page.getByText('J', { exact: true })).toBeVisible();

  await context.close();
});