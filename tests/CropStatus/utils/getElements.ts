import { Page } from "@playwright/test";

export function getcropStatusElements(page: Page) {
  // Función helper para elementos comunes
  return {
    // Selectores Campo/Lote
    farm: page.getByRole('textbox', { name: 'Buscar campo o lote' }),
    farmName: page.getByRole('textbox', { name: 'Buscar campo o lote' }),
    selectFarm: page.getByText('test admin').first(),
    selectfield: page.getByText('Admin 1').first(),

    // Elemento toggle-sidenav
    toggleSidenav: page.locator('[aura-test="toggle-sidenav-button"]').first(),
    // Selectores de la sección de estado del cultivo
    cropStatusSection: page.locator('[aura-test="container-layout"] .field-crop .crop'),
    cropStatusSectionCrop: page.locator('#arch__feature--body').getByText('Arroz'),
    // Selector de Lotes en Estado del cultivo
    cropStatusSectionField: page.locator('[aura-test="container-layout"] .field-crop-container .field'),
    cropStatusSectionField1: page.getByText('Admin 2').first(),
    cropStatusSectionField2: page.getByText('Admin 3').first(),
    // Selector del gráfico de estado del cultivo
    cropStatusGraph: page.locator('[aura-test="content-layout"] #div_contenedor_historico .js-plotly-plot'),
    closedCropStatus: page.locator('#arch__feature--container svg').first(),
    cropStatusText: page.locator('#arch__feature--body').getByText('Estado del cultivo', { exact: true }),
    // Selectores de la sección de alertas
    alertsSection: page.locator('#arch__feature--container').getByText('Alertas', { exact: true }),
    closedAlerts: page.locator('#arch__feature--container svg').nth(1),
    alertsText: page.locator('#arch__feature--body').getByText('Alertas', { exact: true }),
    // Selectores de la sección de recomendaciones
    recommendationsSection: page.locator('#arch__feature--container').getByText('Recomendaciones', { exact: true }),
    closedRecommendations: page.locator('#arch__feature--container svg').nth(2),
    recommendationsText: page.locator('#arch__feature--body').getByText('Recomendaciones', { exact: true }),
  };
}