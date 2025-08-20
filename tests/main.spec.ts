import { test } from '@playwright/test';
import { testLogin } from './01-testlogin/loginPage.spec';
import { testRainglog, testForecast } from './02-weather/weatherPage.spec';

// Puedes agregar más imports de otros archivos de test aquí

// Lee el navegador desde la variable de entorno BROWSER, por defecto 'chromium'
// BROWSER=firefox npx playwright test tests/main.spec.ts
// const browser = (process.env.BROWSER as 'chromium' | 'firefox' | 'webkit') || 'chromium';
// console.log(browser);

// Aquí puedes agregar más tests o flujos de trabajo que necesites ejecutar
test('Ejecutar testLogin', async ({ page, context, browser }) => {
  await testLogin(page, context);
  console.log(`testLogin ejecutado en: ${browser.browserType().name()}`);
});

test('auraview.weather.forescast.fecha.temperature', async ({ page, context, browser }) => {
  await testForecast(page, context);
  console.log(`testForescast ejecutado en: ${browser.browserType().name()}`);
});

test('auraview.weather.rainlog.grafico.validateCalendarDate', async ({ page, context, browser }) => {
  await testRainglog(page, context);
  console.log(`testWeather ejecutado en: ${browser.browserType().name()}`);
});