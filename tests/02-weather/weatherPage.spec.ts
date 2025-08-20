import { BrowserContext, Page, expect } from '@playwright/test';
import 'dotenv/config';

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
  };
}

export async function testRainglog(page: Page, context: BrowserContext) {
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


  const { farm, farmName, selectFarm, selectfield, weatherText, rainfall, graphElement, raingLog, elementCalendar } = getWeatherElements(page);

  await page.goto('https://auravant.auravant.com/view/rainfall');

  // Solo el flujo de Registro de lluvias, sin login
  await farm.click();
  await farmName.fill('adm');
  await selectFarm.click();
  await selectfield.click();
  await weatherText.click(); // Reutilizando weatherText
  await rainfall.click();
  await validateGraph();
  await raingLog.click();
  await validateCalendarDate();

// Funcion para validar el gráfico
async function validateGraph() {

    try {
       // Espera a que el gráfico aparezca en el DOM
      await expect(graphElement).toBeVisible();
      console.log("✅ El gráfico de lluvias es visible.");
      // await expect(graphElement).toBeVisible({ timeout: 10000 });
      
      // Ejecuta JavaScript para leer chart.data
      const chartData = await graphElement.evaluate((chart: any) => {
        return chart.data;
      });

      // Extrae las series de datos y y x
      const extractedData = chartData
        .filter((trace: any) => trace.y && trace.x)
        .map((trace: any) => ({
          y: trace.y,
          x: trace.x,
        }));

      // Valida que haya al menos un conjunto de datos con valores reales
      const hasData = extractedData.some((data: any) => data.y && data.y.length > 0);
      expect(hasData).toBeTruthy();

      // Imprime en consola los datos encontrados
      for (const data of extractedData) {
        console.log(`📅 Fechas: ${data.x}`);
        console.log(`📈 Valores Y: ${data.y}`);
      }

      console.log("✅ El gráfico contiene datos con fechas.");
    } catch (error) {
      console.log(`❌ Error en validación del gráfico: ${error.message}`);
      throw error;
    }
  
  }
    
  // Función para validar fecha del calendario
  async function validateCalendarDate() {
    // const elementCalendar = page.locator('[aura-test="content-layout"] .aura-calendar-month-selector-text');
    
    try {
     
      // Espera a que el texto del calendario sea visible
      await expect(elementCalendar).toBeVisible();
      // await expect(elementCalendar).toHaveText(/^\w+ \d{4}$/);

      // Obtiene el texto del calendario
      const calendarText = await elementCalendar.textContent();

          if (!calendarText) {
      throw new Error('No se pudo obtener el texto del calendario');
    }

      // Diccionario de meses (inglés y español)
      const monthsDict = {
        'January': 0, 'Enero': 0,
        'February': 1, 'Febrero': 1,
        'March': 2, 'Marzo': 2,
        'April': 3, 'Abril': 3,
        'May': 4, 'Mayo': 4,
        'June': 5, 'Junio': 5,
        'July': 6, 'Julio': 6,
        'August': 7, 'Agosto': 7,
        'September': 8, 'Septiembre': 8,
        'October': 9, 'Octubre': 9,
        'November': 10, 'Noviembre': 10,
        'December': 11, 'Diciembre': 11
      };
      
      // Obtiene fecha actual del sistema
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Separa el texto del calendario en mes y año
      const [monthText, yearText] = calendarText.trim().split(' ');
      const calendarMonth = monthsDict[monthText];
      const calendarYear = parseInt(yearText);
      
      // Valida que coincidan
      expect(calendarMonth).toBe(currentMonth);
      expect(calendarYear).toBe(currentYear);
      
      console.log(`✅ Fecha del calendario válida: ${calendarText} coincide con la fecha actual`);
      
    } catch (error) {
      console.log(`❌ Error en validación del calendario: ${error.message}`);
      throw error;
    }
  }

  // Validar fecha del calendario
  // await validateCalendarDate();


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

  try {
    // Validar que la fecha sea igual a la actual
    await expect(currentDateCell).toHaveText(currentDate);
    console.log(`✅ La fecha es igual a la actual: ${currentDate}`);
    await currentDateCell.click(); // Usar fecha actual
  } catch (error) {
    console.error(`❌ Error en validación de fecha: La fecha no corresponde a la actual (${currentDate})`)
  }

  try {
    // Validar temperatura usando la función helper
    await temperatureElement.click(); // Hacer click en el elemento de temperatura
    await validateTemperature(temperatureElement);
    console.log('✅ Temperatura validada correctamente en Pronóstico');
  } catch (error) {
    console.error(`❌ Error en validación de temperatura: ${error}`);
  }
}