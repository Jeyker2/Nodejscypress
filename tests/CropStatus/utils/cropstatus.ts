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

  const { farm, farmName, selectFarm, selectfield, toggleSidenav, cropStatusSection, cropStatusSectionCrop, cropStatusGraph, cropStatusSectionField, cropStatusSectionField1, cropStatusSectionField2 } = getcropStatusElements(page);

  // Aquí iría la lógica específica para probar el estado del cultivo
  await page.goto('https://auravant.auravant.com/view/cropstatus');

  // Solo el flujo de Crop Status, sin login
  await farm.click();
  await farmName.fill('adm');
  await selectFarm.click();
  await selectfield.click();
  await toggleSidenav.click();
  await validateCropStatus();

  // Validaciones específicas del estado del cultivo  
async function validateCropStatus() {

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

// yAxisData.forEach((trace: any) => {
//   console.log(`Traza: ${trace.name}`);
//   console.log(`Todos los valores Y:`, trace.yData);

yAxisData.forEach((trace: any) => {
  console.log(`  Traza ${trace.traceIndex} (${trace.name}): ${trace.yData.length} puntos`);
  console.log(`  Valores Y: [${trace.yData.slice(0, 5).join(', ')}${trace.yData.length > 5 ? '...' : ''}]`);
});

    // await expect(cropStatusSection).toBeVisible();
    // console.log("✅ La sección de Estado del cultivo es visible.");
    // await cropStatusText.click();
    // await expect(closedCropStatus).toBeVisible();
    // console.log("✅ El ícono de Estado del cultivo es visible.");

    // await expect(alertsSection).toBeVisible();
    // console.log("✅ La sección de Alertas es visible.");
    // await alertsText.click();
    // await expect(closedAlerts).toBeVisible();
    // console.log("✅ El ícono de Alertas es visible.");

    // await expect(recommendationsSection).toBeVisible();
    // console.log("✅ La sección de Recomendaciones es visible.");
    // await recommendationsText.click();
    // await expect(closedRecommendations).toBeVisible();
    // console.log("✅ El ícono de Recomendaciones es visible.");
  }

  // await validateCropStatus();

  
}