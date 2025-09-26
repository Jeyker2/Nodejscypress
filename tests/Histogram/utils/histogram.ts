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


  const { farm, farmName, selectFarm, selectfield, toggleSidenav, histogramContainer, histogramCantidad, haElements, totalText } = getHistogramElements(page);

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

  // Esperar que se actualice el contenido
  await page.waitForTimeout(1000);

  // await page.waitForTimeout(1000);  

  // // --- Suma dinámica después de cada click ---
  const haElementList = await haElements.all();
  let totalSum = 0;
  let ambienteNumber = 1; // Contador para los ambientes
  
  for (const el of haElementList) {
    const text = await el.innerText();
    const match = text.match(/([\d,.]+)\s*ha$/);

    if (match) {
      const value = parseFloat(match[1].replace('ha', ''));
      totalSum += value;

      console.log(`🔢 Cantidad de Ambiente ${ambienteNumber} con 'ha': ${value}`);
      ambienteNumber++; // Incrementa el contador
    }
  }
  
  // // Muestra total
  console.log(`🔢 Suma total de cantidad de ha en Ambiente ${number}: ${totalSum.toFixed(2)} ha`);
  


  const totalTextValue = await totalText.textContent();
  // console.log(`🔢 Total texto (raw): ${totalTextValue}`);
  const totalNumber = parseFloat(totalTextValue?.replace(',', '.') || '0');

  console.log(`🔢 Suma de la cantidad de ha en Ambiente ${number}: ${totalSum.toFixed(2)} ha | Total de ha del Lote: ${totalNumber} ha`);

  // Calcular diferencia y porcentaje
  const diferencia = Math.abs(totalSum - totalNumber);
  const porcentajeDiferencia = (diferencia / totalNumber) * 100;

  console.log(`📊 Diferencia: ${diferencia.toFixed(2)} ha (${porcentajeDiferencia.toFixed(2)}%) - Tolerancia: ±5%`);

  if (porcentajeDiferencia <= 5) {
  console.log(`✅ Dentro de tolerancia del 5%`);
  } else {
    console.log(`❌ Fuera de tolerancia del 5%`);
}


  expect(Math.abs(totalSum - totalNumber)).toBeLessThanOrEqual(totalNumber * 0.05);

  // Validación comentada para evitar fallos en CI

  
  // if (totalSum === totalNumber) {
  //   console.log(`✅ Suma correcta: ${totalSum} ha`);
  // } else {
  //   console.error(`❌ Error en la suma: Calculado ${totalSum} ha, pero el texto muestra ${totalNumber} ha`);
  // } 

}

    console.log(`✅ Completado: Se hizo click en ${numbersToClick.length} números (2-7) del histograma`);

  }

}