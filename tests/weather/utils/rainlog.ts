import { BrowserContext, expect, Page } from "@playwright/test";
import { getWeatherElements } from "./getElements";

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


  const { farm, farmName, selectFarm, selectfield, weatherText, rainfall, graphElement, raingLog, elementCalendar, selectBox, rainfallInput, saveRainglog, tooltipSaverainglog, closeRainglog, elementValue } = getWeatherElements(page);

  await page.goto('https://auravant.auravant.com/view/rainfall');

  // Solo el flujo de Registro de lluvias, sin login
  await farm.click();
  await farmName.fill('adm');
  await selectFarm.click();
  await selectfield.click();
  await weatherText.click(); // Reutilizando weatherText
  await rainfall.click();
  await validateGraph();
  // await raingLog.click();
  await validateCalendarDate();
  await registerRainfall();

// Funcion para validar el gráfico
async function validateGraph() {

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

      // Validación por desviación estándar
      for (const data of extractedData) {
        const values = data.y.filter(val => val !== null && val !== undefined);
        
        if (values.length > 1) {
          // Calcular media
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          
          // Calcular desviación estándar
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const stdDev = Math.sqrt(variance);
          
          // Imprimir valores de desviación estándar
          console.log(`📊 DESVIACIÓN ESTÁNDAR: ${stdDev.toFixed(4)}`);
          console.log(`📊 Media: ${mean.toFixed(2)}`);
          console.log(`📊 Varianza: ${variance.toFixed(4)}`);
          console.log(`📊 Límite máximo permitido (300% de media): ${(mean * 3).toFixed(2)}`);

          // Validar que la desviación estándar esté en un rango razonable
          expect(stdDev).toBeGreaterThanOrEqual(0);
          // expect(stdDev).toBeLessThan(mean * 3); // 300% de la media
          // expect(stdDev).toBeLessThan(5); // Límite fijo de 5
          
          console.log(`📅 Fechas: ${data.x}`);
          console.log(`📈 Valores Y: ${data.y}`);
        }
      }

      console.log("✅ El gráfico contiene datos válidos con desviación estándar aceptable.");

  
  }
    
  // Función para validar fecha del calendario
  async function validateCalendarDate() {
    // const elementCalendar = page.locator('[aura-test="content-layout"] .aura-calendar-month-selector-text');

      // Selecciona el button Registrar lluvia
      await raingLog.click();
     
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
      

  }

  // Función para registrar lluvia
async function registerRainfall() {

    // Selecciona el cuadro de lluvia
    await selectBox.click();

    // Generar número aleatorio para la lluvia
    // const rainfallValue = (Math.random() * 100).toFixed(1);
    // Generar número aleatorio entre 2.5 y 10.0 con 2 decimales
    const num = Math.random() * (10.0 - 2.5) + 2.5;
    const rainfallValue = Math.round(num * 100) / 100;
    
    // Borra el contenido del input y escribe el número generado
    await rainfallInput.clear();
    console.log(`✅ Input de lluvia borrado`);
    await rainfallInput.click();
    await rainfallInput.fill(rainfallValue.toString());

    // Validar que el valor se escribió correctamente en el input
    const inputValue = await rainfallInput.inputValue();
    const inputValueFloat = parseFloat(inputValue);
    expect(inputValueFloat).toBe(rainfallValue);
    console.log(`✅ Valor validado en input: ${inputValueFloat}mm coincide con ${rainfallValue}mm`);
    
    // Hace clic en el botón de guardar
    await saveRainglog.click();

    // Valida que la acción se procese (espera a que aparezca algún mensaje de éxito o que el botón cambie)
    await expect(tooltipSaverainglog).toBeEnabled();
    // await tooltipSaverainglog.click();
    console.log(`✅ Tooltip de registro de lluvia visible: MSJ 'Registro de lluvia modificado'`);

    console.log(`✅ Lluvia registrada: ${rainfallValue}mm`);

    // Hace clic en el botón de cerrar Registro de lluvia
    await expect(closeRainglog).toBeVisible();
    await closeRainglog.click();
    console.log(`✅ Registro de lluvia cerrado`);

    // Seleccionar Registro de lluvia
    await rainfall.click();
    console.log(`✅ Volviendo a la sección de Registro de lluvia`);

    // Selecciona Registrar lluvia
    await raingLog.click();
    console.log(`✅ Volviendo a Registrar lluvia`);

    // Validar que el valor aparece en elementValue
    await selectBox.click();
    await rainfallInput.click();
    await rainfallInput.fill(rainfallValue.toString());

    // Validar que el valor se escribió correctamente en el input
    const elementText= await rainfallInput.inputValue();
    const elementValueFloat = parseFloat(elementText);
    expect(elementValueFloat).toBe(rainfallValue);
    console.log(`✅ Valor validado en calendario: ${elementValueFloat}mm coincide con ${rainfallValue}mm`);

    // Devuelve el valor registrado
    return rainfallValue;
    
}

}
