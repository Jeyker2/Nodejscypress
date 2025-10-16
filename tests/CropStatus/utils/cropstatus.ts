import { BrowserContext, expect, Page } from '@playwright/test';
import { getcropStatusElements } from './getElements';

export async function testcropStatus(page: Page, context: BrowserContext) {

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

  const { farm, farmName, selectFarm, selectfield, toggleSidenav, cropStatusFeature, cropStatusSection, cropStatusSectionCrop, cropStatusGraph, cropStatusSectionField, cropStatusSectionField1, cropStatusSectionField2, closedCropStatus, cropStatusText, startDateElement, endDateElement, cropStatusGraphData, startDateInput, endDateInput, applyDateButtonStart, applyDateButtonStartMonth, applyDateButtonEndMonth, applyDateButtonEnd } = getcropStatusElements(page);

  // Aquí iría la lógica específica para probar el estado del cultivo
  await page.goto('https://auravant.auravant.com/view');

  // Solo el flujo de Crop Status, sin login
  await farm.click();
  await farmName.fill('adm');
  await selectFarm.click();
  await selectfield.click();
  await toggleSidenav.click();
  await validateCropStatusDateGraph();
  await validateCropcStatusDate();

  // Validaciones específicas del estado del cultivo  
async function validateCropStatusDateGraph() {
  await expect(toggleSidenav).toBeVisible();
  console.log("✅ El botón de menú lateral es visible.");
  await toggleSidenav.click();

  await expect(cropStatusFeature).toBeVisible();
  console.log("✅ La opción de Estado del cultivo es visible en el menú lateral.");
  await cropStatusFeature.click();

  // Espera a que el contenedor del estado del cultivo aparezca en el DOM
  await expect(cropStatusSection).toBeVisible();
  console.log("✅ La sección de Estado del cultivo es visible.");
  await cropStatusSection.click();

  // Validar que el cultivo "Arroz" esté visible
  await expect(cropStatusSectionCrop).toBeVisible();
  await expect (cropStatusSectionCrop).toHaveText(/Arroz/);
  console.log("✅ El cultivo Arroz está visible en la sección de Estado del cultivo.");
  await cropStatusSectionCrop.click();

  // Espera a que el selector de lotes aparezca en el DOM
  await expect(cropStatusSectionField).toBeVisible();
  console.log("✅ El selector de Lotes en Estado del cultivo es visible.");
  await cropStatusSectionField.click();

  // Espera a que los Lotes estén visibles
  await expect(cropStatusSectionField1).toBeVisible();
  console.log("✅ Hay al menos un Lote disponible en el selector.");
  await cropStatusSectionField1.click();
  await cropStatusSectionField2.click();

  // Espera a que el gráfico aparezca en el DOM
  await expect(cropStatusGraph).toBeVisible();
  console.log("✅ El gráfico de Estado del cultivo es visible.");

// Extraer datos del eje Y del gráfico
const yAxisData = await cropStatusGraph.evaluate((graph: any) => {
  if (graph && graph.data) {
    return graph.data.map((trace: any, index: number) => ({
      traceIndex: index,
      name: trace.name || `Trace ${index}`,
      yData: trace.y || []
    }));
  }
  return [];
});

// Validar que hay datos
expect(yAxisData.length).toBeGreaterThan(0);
console.log("📊 Datos del gráfico:");

yAxisData.forEach((trace: any) => {
  console.log(`  Traza ${trace.traceIndex} (${trace.name}): ${trace.yData.length} puntos`);
  console.log(`  Valores Y: [${trace.yData.slice(0, 5).join(', ')}${trace.yData.length > 5 ? '...' : ''}]`);

});

// Espera que este visible el buton de cerrar
  await expect(closedCropStatus).toBeVisible();
  console.log("✅ El ícono de cerrar en Estado del cultivo es visible.");
  await closedCropStatus.click();

  }

async function validateCropcStatusDate() {

  // Espera a que el contenedor del estado del cultivo aparezca en el DOM
    await expect(cropStatusText).toBeVisible();
    console.log("✅ La sección de Estado del cultivo es visible.");
    await cropStatusText.click();

    await page.waitForTimeout(3000); // Espera adicional para asegurar que el gráfico se haya cargado

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
      return { mean: 0, stdDev: 0, dataPoints: 0, values: [] };
    });

    // Valores initialStats:
    console.log('🔍 DEBUG - Valores iniciales:');
    console.log(`   Mean: ${initialStats.mean}`);
    console.log(`   StdDev: ${initialStats.stdDev}`);
    console.log(`   DataPoints: ${initialStats.dataPoints}`);

    console.log('🔍 VALORES INICIALES:');
    console.log(`   Valores Y: [${initialStats.values.slice(0, 10).join(', ')}${initialStats.values.length > 10 ? '...' : ''}]`);
    console.log(`   Total valores: ${initialStats.values.length}`);
    console.log(`   Suma total: ${initialStats.values.reduce((a:number, b:number) => a + b, 0).toFixed(2)}`);

    // Extraer fechas de ambos elementos
    const startDate = await startDateElement.evaluate(el => 
      el.textContent?.match(/(\d{2}\/\d{2}\/\d{4})/)?.[1]
    );

    const endDate = await endDateElement.evaluate(el => 
      el.textContent?.match(/(\d{2}\/\d{2}\/\d{4})/)?.[1]
    );

    console.log(`Fecha inicio: ${startDate}`);
    console.log(`Fecha fin: ${endDate}`);

    // Validar que las fechas fueron extraídas correctamente
    if (!startDate || !endDate) {
      console.log('❌ No se pudieron extraer las fechas');
      return;
    }

    await page.waitForTimeout(2000); 

    // 2. CAMBIAR FECHAS
    console.log('\n🔄 Cambiando fechas...');

    await startDateInput.click();
    await applyDateButtonStartMonth.click();
    await applyDateButtonStart.click();
    console.log("✅ Nueva fecha de inicio aplicada");

    await endDateInput.click();
    await applyDateButtonEndMonth.click();
    await applyDateButtonEnd.click();
    console.log("✅ Nueva fecha de fin aplicada");

    await page.waitForTimeout(3000); // Esperar actualización del gráfico

    // Capturar las nuevas fechas después del cambio
    const newStartDate = await startDateElement.evaluate(el => 
      el.textContent?.match(/(\d{2}\/\d{2}\/\d{4})/)?.[1]
    );

    const newEndDate = await endDateElement.evaluate(el => 
      el.textContent?.match(/(\d{2}\/\d{2}\/\d{4})/)?.[1]
    );

    console.log('\n📅 FECHAS CAMBIADAS:');
    console.log(`📅 Fecha inicio: ${startDate} → ${newStartDate}`);
    console.log(`📅 Fecha fin: ${endDate} → ${newEndDate}`);

    // 3. RECALCULAR ESTADÍSTICAS
    const newStats = await cropStatusGraphData.evaluate((graph: any) => {
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
      return { mean: 0, stdDev: 0, dataPoints: 0, values: [] };
    });

    // Valores newStats:
    console.log('🔍 DEBUG - Valores finales:');
    console.log(`   Mean: ${newStats.mean}`);
    console.log(`   StdDev: ${newStats.stdDev}`);
    console.log(`   DataPoints: ${newStats.dataPoints}`);

    // 4. COMPARAR RESULTADOS
    console.log('🔍 VALORES DESPUÉS DEL CAMBIO:');
    console.log(`   Valores Y: [${newStats.values.slice(0, 10).join(', ')}${newStats.values.length > 10 ? '...' : ''}]`);
    console.log(`   Total valores: ${newStats.values.length}`);
    console.log(`   Suma total: ${newStats.values.reduce((a:number, b:number) => a + b, 0).toFixed(2)}`);


    // Reemplaza las líneas donde calculas meanChange y stdDevChange
    const meanChange = initialStats.mean !== 0 
      ? ((newStats.mean - initialStats.mean) / initialStats.mean * 100).toFixed(2)
      : 'N/A (valor inicial es 0)';

    const stdDevChange = initialStats.stdDev !== 0 
      ? ((newStats.stdDev - initialStats.stdDev) / initialStats.stdDev * 100).toFixed(2)
      : 'N/A (valor inicial es 0)';

    console.log(`📈 Cambio en media: ${meanChange}%`);
    console.log(`📈 Cambio en desviación estándar: ${stdDevChange}%`);

    // 5. VALIDACIONES CON ASSERTS
    // Validar que las fechas cambiaron
    expect(startDate).not.toBe(newStartDate);
    expect(endDate).not.toBe(newEndDate);
    console.log('✅ ASSERT: Las fechas cambiaron correctamente');

    // Validar que las estadísticas cambiaron
    expect(initialStats.mean).not.toBe(newStats.mean);
    expect(initialStats.stdDev).not.toBe(newStats.stdDev);
    console.log('✅ ASSERT: Las estadísticas cambiaron correctamente');

    // Validar que hay datos en ambos períodos
    expect(initialStats.dataPoints).toBeGreaterThan(0);
    expect(newStats.dataPoints).toBeGreaterThan(0);
    console.log('✅ ASSERT: Ambos períodos tienen datos válidos');

    // Espera que este visible el buton de cerrar
    await expect(closedCropStatus).toBeVisible();
    console.log("✅ El ícono de cerrar en Estado del cultivo es visible.");
    await closedCropStatus.click();

  }

  
}