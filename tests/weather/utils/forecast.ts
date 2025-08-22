import { BrowserContext, expect, Page } from "@playwright/test";
import { getWeatherElements } from "./getElements";

export async function testForecast(page: Page, context: BrowserContext) {
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

  const { farm, farmName, selectFarm, selectfield, weatherText, forecastSection, currentDateCell, currentDate, temperatureElement,validateTemperature } = getWeatherElements(page);

  await page.goto('https://auravant.auravant.com/view/forecast');


  // Solo el flujo de pronóstico sin login
  await farm.click();
  await farmName.fill('adm');
  await selectFarm.click();
  await selectfield.click();
  await weatherText.click(); // Reutilizando weatherText
  await forecastSection.click();


    // Validar que la fecha sea igual a la actual
    await expect(currentDateCell).toHaveText(currentDate);
    console.log(`✅ La fecha es igual a la actual: ${currentDate}`);
    await currentDateCell.click(); // Usar fecha actual

    


    // Validar temperatura usando la función helper
    await temperatureElement.click(); // Hacer click en el elemento de temperatura
    await validateTemperature(temperatureElement);
    console.log('✅ Temperatura validada correctamente en Pronóstico');


}