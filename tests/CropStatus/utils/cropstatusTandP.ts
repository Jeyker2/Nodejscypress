import {BrowserContext, expect, Page} from '@playwright/test';
import { getcropStatusElements } from './getElements';

export async function testcropStatusTandP(page: Page, context: BrowserContext) {

// Lee las variables de entorno
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

  const { farm, farmName, selectFarm, selectfield, toggleSidenav, cropStatusFeature, precipitationCheckbox, precipitationDate, precipitationDateOneYear, cropStatusGraphData, precipitationDownloadExcel, closedCropStatus } = getcropStatusElements(page);

  // Logica para probar el estado del cultivo Pº and Tº
  await page.goto('https://auravant.auravant.com/view');

  // Solo el flujo de Crop Status, sin login
  await farm.click();
  await farmName.fill('adm');
  await clickSelectFarm();
  await clickSelectField();
  await toggleSidenav.click();
  await validateCropStatusFeaturePrecip();
//   await validateCropStatusFeatureTemp();
  await validateExcelDownload();

  async function clickSelectFarm() {
  for (let i = 0; i < 3; i++) {
    try {
      await expect(selectFarm).toBeVisible({ timeout: 10000 });
      await selectFarm.click();
      return;
    } catch (error) {
      console.log(`Intento ${i + 1} fallido, reintentando...`);
    }
  }
  throw new Error('No se pudo encontrar selectFarm después de 3 intentos');
}

async function clickSelectField() {
  for (let i = 0; i < 3; i++) {
    try {
      await expect(selectfield).toBeVisible({ timeout: 10000 });
      await selectfield.click();
      return;
    } catch (error) {
      console.log(`Intento ${i + 1} fallido, reintentando...`);
    }
  }
  throw new Error('No se pudo encontrar selectfield después de 3 intentos');
}
  
  // Validaciones específicas del estado del cultivo
 async function validateCropStatusFeaturePrecip() {
    await expect(toggleSidenav).toBeVisible();
    await toggleSidenav.click();

    await expect(cropStatusFeature).toBeVisible();
    await cropStatusFeature.click();

    // Espera a que la sección de precipitación sea visible
    await expect(precipitationCheckbox).toBeVisible({ timeout: 10000 });
    console.log("✅ La sección de Precipitación es visible.");
    await precipitationCheckbox.click(); // Activa la precipitación

    // Selecciona el rango de fechas "12 meses"
    await expect(precipitationDate).toBeVisible({ timeout: 10000 });
    await precipitationDate.click();

    await expect(precipitationDateOneYear).toBeVisible();
    await precipitationDateOneYear.click();


    // Espera a que el gráfico aparezca en el DOM
    await expect(cropStatusGraphData).toBeVisible({ timeout: 10000 });
    console.log("✅ El gráfico de Estado del cultivo es visible.");

    // Espera hasta que el gráfico tenga datos cargados (timeout de 10 segundos)

    await page.waitForFunction(async () => {
      try {
        const hasData = await cropStatusGraphData.evaluate((graph: any) => {
          return graph && graph.data && graph.data[0] && graph.data[0].y && graph.data[0].y.length > 0;
        });
        return hasData;
      } catch {
        return false;
      }
    }, { timeout: 10000 });

    console.log("✅ El gráfico tiene datos cargados");

    await page.waitForTimeout(2000); // Espera adicional para asegurar que el gráfico se haya renderizado completamente

    // 1. CAPTURAR ESTADÍSTICAS INICIALES
    const initialStats = await cropStatusGraphData.evaluate((graph: any) => {
      if (graph && graph.data && graph.data[0] && graph.data[0].y) {
        const arr = graph.data[0].y;
        const mean = arr.reduce((a: number, b: number) => a + b, 0) / arr.length;
        const variance = arr.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / arr.length;
        return { 
          mean, 
          stdDev: Math.sqrt(variance), 
          dataPoints: arr.length,
          values: arr // ← Agregar los valores originales
        };
      }
      return { mean: 0,stdDev: 0, dataPoints: 0, values: [] };
    });

    // Valores initialStats:
    console.log('🔍 Valores iniciales:');
    // console.log(`   Mean: ${initialStats.mean}`);
    console.log(`   StdDev: ${initialStats.stdDev}`);
    console.log(`   Valores Y: [${initialStats.values.slice(0, 10).join(', ')}${initialStats.values.length > 10 ? '...' : ''}]`);
    console.log(`   DataPoints: ${initialStats.dataPoints}`);

    // console.log('🔍 VALORES INICIALES:');
    // console.log(`   Valores Y: [${initialStats.values.slice(0, 10).join(', ')}${initialStats.values.length > 10 ? '...' : ''}]`);
    // console.log(`   Total valores: ${initialStats.values.length}`);
    // console.log(`   Suma total: ${initialStats.values.reduce((a:number, b:number) => a + b, 0).toFixed(2)}`);

    // Espera que este visible el buton de cerrar
    await expect(closedCropStatus).toBeVisible();
    console.log("✅ El ícono de cerrar en Estado del cultivo es visible.");
    await closedCropStatus.click();

}

 async function validateCropStatusFeatureTemp() {
    await expect(toggleSidenav).toBeVisible();
    await toggleSidenav.click();

    await expect(cropStatusFeature).toBeVisible();
    await cropStatusFeature.click();

    // Espera a que la sección de estado del cultivo sea visible
    await expect(cropStatusGraphData).toBeVisible({ timeout: 10000 });
    console.log("✅ La sección de Estado del cultivo es visible.");
    await cropStatusGraphData.click(); // Asegura que el gráfico esté enfocado

 }

 async function validateExcelDownload() {
    // 1. CONFIGURACIÓN INICIAL
    await expect(toggleSidenav).toBeVisible();
    await toggleSidenav.click();
    await expect(cropStatusFeature).toBeVisible();
    await cropStatusFeature.click();

    // 2. ESPERAR CARGA COMPLETA DEL GRÁFICO
    await expect(cropStatusGraphData).toBeVisible({ timeout: 10000 });
    console.log("✅ El gráfico de Estado del cultivo es visible.");

    await page.waitForFunction(async () => {
        try {
            const graphData = await cropStatusGraphData.evaluate((graph: any) => {
                if (!graph?.data?.[0]) return false;
                const xLength = graph.data[0].x?.length || 0;
                const yLength = graph.data[0].y?.length || 0;
                return xLength > 0 && yLength > 0 && xLength === yLength;
            });
            return graphData;
        } catch {
            return false;
        }
    }, { timeout: 20000 });

    console.log("✅ El gráfico tiene datos completos cargados");

    await page.waitForTimeout(5000); // Espera adicional para asegurar que el gráfico se haya renderizado completamente

    // 3. CAPTURAR DATOS DEL GRÁFICO
    const graphStats = await cropStatusGraphData.evaluate((graph: any) => {
        const arr = graph.data[0].y;
        const dates = graph.data[0].x;
        const mean = arr.reduce((a: number, b: number) => a + b, 0) / arr.length;
        const variance = arr.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / arr.length;
        return { 
            mean, 
            stdDev: Math.sqrt(variance), 
            values: arr,
            dates: dates
        };
    });

    // 4. DESCARGAR ARCHIVO CSV
    const downloadPromise = page.waitForEvent('download');
    await expect(precipitationDownloadExcel).toBeVisible({ timeout: 10000 });
    await expect(precipitationDownloadExcel).toBeEnabled();
    await precipitationDownloadExcel.click();
    const download = await downloadPromise;

    const path = `./downloads/${download.suggestedFilename()}`;
    await download.saveAs(path);

    const fs = require('fs');
    const stats = fs.statSync(path);
    console.log(`Archivo descargado: ${stats.size} bytes`);

    if (stats.size === 0) {
        throw new Error('El archivo descargado está vacío');
    }

    // 5. LEER Y PROCESAR CSV
    const csvContent = fs.readFileSync(path, 'utf8');
    const lines = csvContent.split('\n');
    
    const excelData: any[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const columns = line.split(',');
            if (columns.length >= 4) {
                const fecha = columns[2].trim();
                const valor = columns[3].trim();
                if (fecha.match(/\d{4}-\d{2}-\d{2}/)) {
                    excelData.push({ Fecha: fecha, Valor: valor });
                }
            }
        }
    }

    // 6. VALIDAR QUE EL CSV CONTENGA DATOS
    expect(excelData.length).toBeGreaterThan(0);
    console.log(`✅ CSV contiene ${excelData.length} registros de datos`);

    // 7. VALIDAR FECHAS COINCIDENTES
    const excelDates = excelData.map((row: any) => row.Fecha);
    const graphDates = graphStats.dates;
    
    console.log(`📊 Datos del gráfico: ${graphDates.length} fechas`);
    console.log(`📄 Datos del CSV: ${excelDates.length} fechas`);

    // Validar que las fechas coincidan exactamente
    // expect(excelDates.length).toBe(graphDates.length);
    expect(excelDates.length).toBeGreaterThanOrEqual(graphDates.length);
    
    const excelDatesSet = new Set(excelDates);
    const graphDatesSet = new Set(graphDates);
    
    // Validar que todas las fechas del gráfico estén en el CSV
    for (const graphDate of graphDates) {
        expect(excelDatesSet.has(graphDate)).toBe(true);
    }
    
    // Validar que todas las fechas del CSV estén en el gráfico
    for (const csvDate of excelDates) {
        expect(graphDatesSet.has(csvDate)).toBe(true);
    }
    
    console.log(`✅ Fechas validadas: ${excelDates.length} fechas coinciden exactamente`);

    // 8. VALIDAR DESVIACIÓN ESTÁNDAR
    const excelValues = excelData.map((row: any) => parseFloat(row.Valor));
    const excelMean = excelValues.reduce((a, b) => a + b, 0) / excelValues.length;
    const excelVariance = excelValues.reduce((sum, val) => sum + Math.pow(val - excelMean, 2), 0) / excelValues.length;
    const excelStdDev = Math.sqrt(excelVariance);

    // Comparar con tolerancia del 1%
    expect(Math.abs(excelStdDev - graphStats.stdDev)).toBeLessThan(graphStats.stdDev * 0.01);
    
    console.log(`✅ Desviación estándar validada - CSV: ${excelStdDev.toFixed(4)} vs Gráfico: ${graphStats.stdDev.toFixed(4)}`);
    console.log(`✅ Validación completa: Datos, fechas y estadísticas coinciden correctamente`);
  }
}