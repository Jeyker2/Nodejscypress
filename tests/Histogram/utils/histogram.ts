import { BrowserContext, expect, Page } from "@playwright/test";
import { getHistogramElements } from "./getElements";

export async function testHistogram(page: Page, context: BrowserContext) {
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


  const { farm, farmName, selectFarm, selectfield, toggleSidenav, histogramContainer, histogramCantidad, histogramTooltip } = getHistogramElements(page);

  await page.goto('https://auravant.auravant.com/view');

  // Solo el flujo de Registro de lluvias, sin login
  await farm.click();
  await farmName.fill('adm');
  await selectFarm.click();
  await selectfield.click();
  await toggleSidenav.click();
  await validateHistogram();

  // Función para validar el histograma
  async function validateHistogram() {

    await histogramContainer.click();
    // Espera a que el contenedor del histograma aparezca en el DOM
    await expect(histogramContainer).toBeVisible();
    console.log("✅ El contenedor del histograma es visible.");


const numbersToClick = ['2', '3', '4', '5', '6', '7'];

for (const number of numbersToClick) {
  const element = histogramCantidad(number);
  
  // Espera explícita sin timeout
  await expect(element).toBeVisible();
  // console.log(`✅ Visible: ${number}`);
  
  await element.click();
  console.log(`✅ Clicked Ambiente: ${number}`);
  
  // Esperar que el elemento siga siendo interactuable después del click
  await expect(element).toBeEnabled();
}

console.log(`✅ Completado: Se hizo click en ${numbersToClick.length} números (2-7) del histograma`);
    // Verifica que haya barras en el histograma
    // const barCount = await histogramBars.count();
    // expect(barCount).toBeGreaterThan(0);
    // console.log(`✅ El histograma tiene ${barCount} barras.`);

    // Interactúa con la primera barra para mostrar el tooltip
    // if (barCount > 0) {
    //   await histogramBars.first().hover();
      
    //   // Espera a que el tooltip aparezca
    //   await expect(histogramTooltip).toBeVisible();
    //   console.log("✅ El tooltip del histograma es visible al pasar el mouse sobre una barra.");
    // } else {
    //   console.log("❌ No hay barras en el histograma para interactuar.");
    // }
  }
  // Flujo de integracion con el histograma

  // await histogramContainer.click();
  // await histogramTooltip.click(); // Reutilizando histogramTooltip
  // await histogramBars.click();


}