import { BrowserContext, expect, Locator, Page } from "@playwright/test";
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

  // 1. Calcula la fecha actual en español
  function getCurrentDateInSpanish() {
    const today = new Date();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const day = today.getDate().toString().padStart(2, '0');
    const month = months[today.getMonth()];
    return `${day} de ${month}`;
  }
  const currentDate = getCurrentDateInSpanish();
  
  // 2. Pasa currentDate a getWeatherElements
  const { farm, farmName, selectFarm, selectfield, weatherText, forecastSection, temperatureElement, currentDateCell } = getWeatherElements(page);

  await page.goto('https://auravant.auravant.com/view/forecast');

  // Solo el flujo de pronóstico sin login
  await farm.click();
  await farmName.fill('adm');
  await selectFarm.click();
  await selectfield.click();
  await weatherText.click(); // Reutilizando weatherText
  await forecastSection.click();

  // Validar que la fecha sea igual a la actual
  // const currentDate = await getCurrentDateInSpanish();
  const dateCell = currentDateCell(currentDate);
  await expect(dateCell).toHaveText(currentDate);
  console.log(`✅ La fecha es igual a la actual: ${currentDate}`);
  await dateCell.click();

  // Función para validar temperatura
  async function validateTemperature(temperatureElement: Locator) {
    const temperatureText = await temperatureElement.textContent();
    const temperature = parseInt(temperatureText || '0');
    expect(temperature).toBeGreaterThanOrEqual(-50);
    expect(temperature).toBeLessThanOrEqual(50);
    console.log(`✓ Temperatura válida: ${temperature}°C (rango: -50 a 50)`);
    return temperature;
  }

  // Validar temperatura usando la función helper
  await temperatureElement.click();
  await validateTemperature(temperatureElement);
  console.log('✅ Temperatura validada correctamente en Pronóstico');

}