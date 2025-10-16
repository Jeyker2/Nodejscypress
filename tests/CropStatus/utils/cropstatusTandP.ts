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

  const { farm, farmName, selectFarm, selectfield, toggleSidenav, cropStatusFeature, precipitationCheckbox, precipitationDate, precipitationDateOneYear, cropStatusGraphData } = getcropStatusElements(page);

  // Logica para probar el estado del cultivo Pº and Tº
  await page.goto('https://auravant.auravant.com/view');

  // Solo el flujo de Crop Status, sin login
  await farm.click();
  await farmName.fill('adm');
  await clickSelectFarm();
  await clickSelectField();
  await toggleSidenav.click();
  await validateCropStatusFeaturePrecip();
  await validateCropStatusFeatureTemp();

  async function clickSelectFarm() {
  for (let i = 0; i < 3; i++) {
    try {
      await expect(selectFarm).toBeVisible({ timeout: 10000 });
      await selectFarm.click();
      return;
    } catch (error) {
      console.log(`Intento ${i + 1} fallido, reintentando...`);
      await page.waitForTimeout(2000);
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
      await page.waitForTimeout(2000);
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
  
}
   