import { BrowserContext, expect, Page } from "@playwright/test";
import { getWeatherElements } from "./getElements";

export async function testallOpen(page: Page, context: BrowserContext) {
  // Lee el token de la variable de entorno
  const token = process.env.USER_TOKEN || '';
  const domain = process.env.DOMAIN || 'auravant.com';

  // Agrega el token como cookie antes de navegar
  await context.addCookies([{
    name: 'com.auravant.auth',
    value: token,
    domain: '.' + domain,
    path: '/',
    httpOnly: false,
    secure: true,
    sameSite: 'Lax'
  }]);


  const { farm, farmName, selectFarm, selectfield, weatherText, forecastSection, rainfall, forecastText, closedForecast, rainfallText, rainfallGraph } = getWeatherElements(page);

  await page.goto('https://auravant.auravant.com/view/');

    // Solo el flujo de Registro de lluvias y Pronóstico, sin login
    await farm.click();
    await farmName.fill('adm');
    await selectFarm.click();
    await selectfield.click();
    await weatherText.click(); // Reutilizando weatherText
    await forecastSection.click();
    await forecastText.click();
    await expect(forecastText).toBeVisible();
    console.log("✅ La sección de Pronóstico está visible.");
    await closedForecast.click();
    console.log("✅ Se cerró la sección de Pronóstico.");
    console.log("Navegando a Registro de lluvias...");
    await rainfall.click();
    await expect(rainfallText).toBeVisible();
    await rainfallText.click();
    console.log("✅ La sección de Registro de lluvias está visible.");
    await expect(rainfallGraph).toBeVisible();
    await rainfallGraph.click();
    await closedForecast.click();
    console.log("✅ Se cerró la sección de Registro de lluvias.");
    console.log("--------------------------------------------------");
    console.log("✅ El gráfico de Registro de lluvias es visible.");
    console.log("✅ La sección de Registro de lluvias y su gráfico están visibles.");
    console.log("✅ Validación de Registro de lluvias exitosa.");
    console.log("--------------------------------------------------");
    console.log("✅ Flujo allOpen completado exitosamente.");
    console.log("--------------------------------------------------");

}