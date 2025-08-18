import { test } from '@playwright/test';
import { testLogin } from './01-testlogin/loginPage.spec';
import { testWeather } from './02-weather/weatherPage.spec';

// Puedes agregar más imports de otros archivos de test aquí

// Lee el navegador desde la variable de entorno BROWSER, por defecto 'chromium'
// BROWSER=firefox npx playwright test tests/main.spec.ts
const browser = (process.env.BROWSER as 'chromium' | 'firefox' | 'webkit') || 'chromium';
console.log(browser);

// Aquí puedes agregar más tests o flujos de trabajo que necesites ejecutar
test('Ejecutar testLogin', async () => {
  await testLogin(browser);
  console.log(`testLogin ejecutado en: ${browser}`);
});

test('auraview.weather.forescast.fecha', async () => {
  await testWeather(browser);
  console.log(`testWeather ejecutado en: ${browser}`);
});