import { BrowserContext, Page, expect } from '@playwright/test';
import 'dotenv/config';

// Función helper para elementos comunes
function getWeatherElements(page: Page) {
    // Generar fecha actual en español
  function getCurrentDateInSpanish() {
    const today = new Date();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const day = today.getDate();
    const month = months[today.getMonth()];
    return `${day} de ${month}`;
  }

    // Función para validar temperatura
  async function validateTemperature(temperatureElement) {
    const temperatureText = await temperatureElement.textContent();
    const temperature = parseInt(temperatureText || '0');
    
    // Validar rango -50 a 50
    expect(temperature).toBeGreaterThanOrEqual(-50);
    expect(temperature).toBeLessThanOrEqual(50);
    console.log(`✓ Temperatura válida: ${temperature}°C (rango: -50 a 50)`);
    
    return temperature;
  }

  const currentDate = getCurrentDateInSpanish();

  return {
    // Selectores Campo/Lote
    farm: page.getByRole('textbox', { name: 'Buscar campo o lote' }),
    farmName: page.getByRole('textbox', { name: 'Buscar campo o lote' }),
    selectFarm: page.getByText('test admin').first(),
    selectfield: page.getByText('Admin 1').first(),

    // Selectores de la barra lateral (Weather y Forecast)
    sidemenu: page.locator('.logo > svg'),
    weatherText: page.getByText('Clima'),

    // Selectores de la sección de pronóstico
    forecastSection: page.getByText('Pronóstico').first(),
    // Asserts para validar la fecha actual
    currentDateCell: page.getByRole('cell', { name: currentDate }),
    currentDate: currentDate,
    // Asserts para validar la temperatura
    temperatureElement: page.getByRole('cell', { name: '12|' }).locator('span').first(),
    validateTemperature: validateTemperature,

    // Selectores de la sección de lluvias
    rainfall: page.getByText('Registro de lluvias'),
    weatherData: page.getByText('Pronóstico'),
  };
}

export async function testWeather(page: Page, context: BrowserContext) {
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


  const { farm, farmName, selectFarm, selectfield, weatherText, rainfall  } = getWeatherElements(page);

  await page.goto('https://auravant.auravant.com/view/rainfall');

  // Solo el flujo de weather, sin login
  await farm.click();
  await farmName.fill('adm');
  await selectFarm.click();
  await selectfield.click();
  await weatherText.click(); // Reutilizando weatherText
  await rainfall.click();


}
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
  console.log(`✓ La fecha es igual a la actual: ${currentDate}`);
  await currentDateCell.click(); // Usar fecha actual
  
  // Validar temperatura usando la función helper
  await temperatureElement.click(); // Hacer click en el elemento de temperatura
  // Verificar que el elemento existe
  await expect(temperatureElement).toBeVisible();
  await validateTemperature(temperatureElement);
  console.log('✓ Temperatura validada correctamente en Pronóstico');
}