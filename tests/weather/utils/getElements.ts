import { expect, Page } from "@playwright/test";

export function getWeatherElements(page: Page) {
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

  // Función helper para elementos comunes
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
    temperatureElement: page.locator('#contenido > table > tbody > tr.temp > td:nth-child(2) > span:nth-child(1)'),
    validateTemperature: validateTemperature,

    // Selectores de la sección de lluvias
    rainfall: page.getByText('Registro de lluvias').first(),
    graphElement: page.locator('[aura-test="chart"][class*="grafico"][class*="js-plotly-plot"]'),
    raingLog: page.getByRole('button', { name: 'Registrar lluvia' }),
    elementCalendar: page.locator('[aura-test="content-layout"] .aura-calendar-month-selector-text'),
    selectBox: page.getByRole('cell', { name: '14' }),
    rainfallInput: page.getByRole('spinbutton'),
    saveRainglog: page.getByRole('button', { name: 'Guardar' }),
    tooltipSaverainglog: page.getByText('Registro de lluvia modificado'),
    closeRainglog: page.locator('line').nth(1),
    elementValue: page.locator('[aura-test="date-14"] .aura-calendar-td-content'),
  };
}