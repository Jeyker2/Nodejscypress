import { chromium, firefox, webkit, Browser } from '@playwright/test';
import 'dotenv/config';

export async function testWeather(browserName: 'chromium' | 'firefox' | 'webkit' = 'chromium') {
  let browser: Browser;
  if (browserName === 'firefox') {
    browser = await firefox.launch({ headless: false });
  } else if (browserName === 'webkit') {
    browser = await webkit.launch({ headless: false });
  } else {
    browser = await chromium.launch({ headless: false });
  }

  // Lee el token de la variable de entorno
  const token = process.env.USER_TOKEN || '';

  const context = await browser.newContext({
    locale: 'es-ES'
  });

  // Agrega el token como cookie antes de navegar
  await context.addCookies([{
    name: 'com.auravant.auth', // Cambia 'token' por el nombre real de la cookie si es diferente
    value: token,
    domain: '.auravant.com',
    path: '/',
    httpOnly: false, // o true si tu cookie es httpOnly
    secure: true,    // o false si no es https
    sameSite: 'Lax'
  }]);

  const page = await context.newPage();

  // Variable para el flujo de Weather
  const weather = page.locator('.logo > svg');
  const weatherText = page.getByText('Clima');
  const rainfall = page.getByText('Registro de lluvias');

  // Solo el flujo de weather, sin login
  await page.goto('https://auravant.auravant.com/view/rainfall');
  await weather.click();
  await weatherText.click();
  await rainfall.first().click();

  await context.close();
  await browser.close();
}