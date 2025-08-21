import { expect, Page } from '@playwright/test';

export async function testLogin(page: Page): Promise<void> {
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

  // La sesión ya está disponible a través de los parámetros
}