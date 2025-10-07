import { BrowserContext, expect, Page } from '@playwright/test';
import { getcropStatusElements } from './getElements';
import { time } from 'console';

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

  const { farm, farmName, selectFarm, selectfield, toggleSidenav, cropStatusSection, cropStatusSectionCrop, cropStatusGraph, cropStatusSectionField, cropStatusSectionField1, cropStatusSectionField2, closedCropStatus, cropStatusText, startDateElement, endDateElement, cropStatusGraphData } = getcropStatusElements(page);

  // Aquí iría la lógica específica para probar el estado del cultivo
  await page.goto('https://auravant.auravant.com/view/cropstatus');

  // Solo el flujo de Crop Status, sin login
  await farm.click();
  await farmName.fill('adm');
  await selectFarm.click();
  await selectfield.click();
  await toggleSidenav.click();
  // await validateCropStatusDateGraph();
  await validateCropcStatusDate();

  // Validaciones específicas del estado del cultivo  
async function validateCropStatusDateGraph() {

  // Espera a que el contenedor del estado del cultivo aparezca en el DOM
  
  await expect(cropStatusSection).toBeVisible();
  console.log("✅ La sección de Estado del cultivo es visible.");
  await cropStatusSection.click();

  // Validar que el cultivo "Arroz" esté visible
  await expect(cropStatusSectionCrop).toBeVisible();
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

    // Validar la fecha inicial y fecha final

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

    // Extraer fechas del eje X del gráfico
    const xAxisData = await cropStatusGraphData.evaluate((graph: any) => {
      if (graph && graph.data) {
        const allXData = graph.data.map((trace: any) => trace.x || []).flat();
        return allXData.map((date: string) => ({
          original: date,
          formatted: new Date(date).toLocaleDateString()
        }));
      }
      return [];
    });
    
    console.log('📊 Fechas del gráfico:');
    console.log(`📊 Total de fechas: ${xAxisData.length}`);
    console.log(`📊 Primera fecha: ${xAxisData[0]?.formatted}`);
    console.log(`📊 Última fecha: ${xAxisData[xAxisData.length - 1]?.formatted}`);
    console.log('📊 Todas las fechas:', xAxisData.map((d: any) => d.formatted));

  // Validar que las fechas del gráfico estén dentro del rango seleccionado
  // Encontrar fechas cercanas al rango seleccionado
  // Convertir fechas con formato explícito DD/MM/YYYY
    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    const selectedStartDate = parseDate(startDate);
    const selectedEndDate = parseDate(endDate);

    console.log(`🔍 DEBUG - Fecha inicio: ${startDate} → ${selectedStartDate.toLocaleDateString()}`);
    console.log(`🔍 DEBUG - Fecha fin: ${endDate} → ${selectedEndDate.toLocaleDateString()}`);

    // Obtener fechas únicas del gráfico (eliminar duplicados)
    const uniqueXAxisData = xAxisData.filter((date: any, index: number, self: any[]) => 
      index === self.findIndex((d: any) => d.original === date.original)
    );

    console.log('📊 Fechas únicas del gráfico:');
    console.log(`📊 Total de fechas únicas: ${uniqueXAxisData.length}`);
    console.log('📊 Fechas únicas:', uniqueXAxisData.map((d: any) => d.formatted));

    // AGREGAR AQUÍ EL CÓDIGO DE ESTADÍSTICAS
    // Calcular estadísticas de los datos X (fechas)
    if (uniqueXAxisData.length > 0) {
      // Convertir fechas a timestamps para cálculos
      const timestamps = uniqueXAxisData.map((d: any) => new Date(d.original).getTime());
      
      // Calcular media de timestamps
      const meanTimestamp = timestamps.reduce((sum: number, val: number) => sum + val, 0) / timestamps.length;
      
      // Calcular desviación estándar
      const variance = timestamps.reduce((sum: number, val: number) => sum + Math.pow(val - meanTimestamp, 2), 0) / timestamps.length;
      const stdDev = Math.sqrt(variance);
      
      // Convertir resultados a fechas legibles
      const meanDate = new Date(meanTimestamp);
      const stdDevDays = stdDev / (1000 * 60 * 60 * 24); // Convertir a días
      
      console.log(`📊 Estadísticas de fechas X:`);
      console.log(`   Fecha media: ${meanDate.toLocaleDateString()}`);
      console.log(`   Desviación estándar: ${stdDevDays.toFixed(1)} días`);
      console.log(`   Rango: ${uniqueXAxisData[0]?.formatted} - ${uniqueXAxisData[uniqueXAxisData.length - 1]?.formatted}`);
    }

    // Encontrar fechas más cercanas usando las fechas únicas
    const closestToStart = uniqueXAxisData.reduce((closest: any, current: any) => {
      const currentDate = new Date(current.original);
      const closestDate = new Date(closest.original);
      
      const currentDiff = Math.abs(currentDate.getTime() - selectedStartDate.getTime());
      const closestDiff = Math.abs(closestDate.getTime() - selectedStartDate.getTime());
      
      return currentDiff < closestDiff ? current : closest;
    });

    const closestToEnd = uniqueXAxisData.reduce((closest: any, current: any) => {
      const currentDate = new Date(current.original);
      const closestDate = new Date(closest.original);
      
      const currentDiff = Math.abs(currentDate.getTime() - selectedEndDate.getTime());
      const closestDiff = Math.abs(closestDate.getTime() - selectedEndDate.getTime());
      
      return currentDiff < closestDiff ? current : closest;
    });

    // Calcular diferencias exactas
    const startDifference = Math.abs(selectedStartDate.getTime() - new Date(closestToStart.original).getTime()) / (1000 * 60 * 60 * 24);
    const endDifference = Math.abs(selectedEndDate.getTime() - new Date(closestToEnd.original).getTime()) / (1000 * 60 * 60 * 24);

    console.log(`\n📊 COMPARACIÓN DETALLADA:`);
    console.log(`📅 Fecha inicio seleccionada: ${startDate}`);
    console.log(`📅 Fecha más cercana en gráfico: ${closestToStart.formatted}`);
    console.log(`⏱️  Diferencia exacta: ${startDifference.toFixed(1)} días`);

    console.log(`📅 Fecha fin seleccionada: ${endDate}`);
    console.log(`📅 Fecha más cercana en gráfico: ${closestToEnd.formatted}`);
    console.log(`⏱️  Diferencia exacta: ${endDifference.toFixed(1)} días`);

    // Verificar coincidencias exactas
    console.log(`\n📊 ANÁLISIS DE COINCIDENCIAS:`);
    if (startDifference < 1) {
      console.log(`✅ Fecha inicio: COINCIDENCIA EXACTA o muy cercana`);
    } else {
      console.log(`⚠️  Fecha inicio: APROXIMADA (${Math.round(startDifference)} días de diferencia)`);
    }

    if (endDifference < 1) {
      console.log(`✅ Fecha fin: COINCIDENCIA EXACTA o muy cercana`);
    } else {
      console.log(`⚠️  Fecha fin: APROXIMADA (${Math.round(endDifference)} días de diferencia)`);
    }

    await page.waitForTimeout(2000);

    
    // Espera que este visible el buton de cerrar
    await expect(closedCropStatus).toBeVisible();
    console.log("✅ El ícono de cerrar en Estado del cultivo es visible.");
    await closedCropStatus.click();

  }

  
}