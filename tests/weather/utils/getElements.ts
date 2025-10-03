import { Page } from "@playwright/test";

export function getWeatherElements(page: Page, currentDate: string, validateTemperature: string) {
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
    // assert para validar el texto 
    forecastText: page.locator('#arch__feature--body').getByText('Pronóstico', { exact: true }),
    closedForecast: page.locator('#arch__feature--container svg').nth(1),
    // Asserts para validar la fecha actual
    currentDateCell: page.getByRole('cell', { name: currentDate }),
    currentDate: currentDate,
    // Asserts para validar la temperatura
    temperatureElement: page.locator('#contenido > table > tbody > tr.temp > td:nth-child(2) > span:nth-child(1)'),
    validateTemperature: validateTemperature,

    // Selectores de la sección de lluvias
    rainfall: page.getByText('Registro de lluvias').first(),
    // Asserts para validar el texto
    rainfallText: page.locator('#arch__feature--body').getByText('Registro de lluvias', { exact: true }),
    // Asserts para validar el gráfico
    rainfallGraph: page.locator('.nsewdrag'),
    // Asserts para validar el gráfico
    graphElement: page.locator('[aura-test="chart"][class*="grafico"][class*="js-plotly-plot"]'),
    rainLog: page.getByRole('button', { name: 'Registrar lluvia' }),
    elementCalendar: page.locator('[aura-test="content-layout"] .aura-calendar-month-selector-text'),
    selectBox: page.getByRole('cell', { name: '14' }),
    rainfallInput: page.getByRole('spinbutton'),
    saveRainlog: page.getByRole('button', { name: 'Guardar' }),
    tooltipSaveRainlog: page.getByText('Registro de lluvia modificado'),
    closeRainlog: page.locator('line').nth(1),
    elementValue: page.locator('[aura-test="date-14"] .aura-calendar-td-content'),
  };
}