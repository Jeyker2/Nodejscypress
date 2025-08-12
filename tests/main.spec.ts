import { test } from '@playwright/test';
import { testLogin } from './01-testlogin/loginPage.spec';

// Puedes agregar más imports de otros archivos de test aquí

// Lee el navegador desde la variable de entorno BROWSER, por defecto 'chromium'
// BROWSER=firefox npx playwright test tests/main.spec.ts
const browser = (process.env.BROWSER as 'chromium' | 'firefox' | 'webkit') || 'chromium';

test('Ejecutar testLogin', async () => {
  await testLogin(browser);
  console.log(`Test ejecutado en: ${browser}`);
});

// Si tienes más funciones de test, agrégalas aquí:
// test('Otro test', async () => { await otroTest(); });