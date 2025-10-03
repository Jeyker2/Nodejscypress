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


  const { farm, farmName, selectFarm, selectfield, toggleSidenav, histogramContainer, histogramCantidad, haElements, totalText, ambientactionContainer, ambientationYearList, ambientationCurrentLayer, ambientationButtonContinue, ambientationButtonBack, ambientationSurface1, ambientationSurface2, ambientationDeleteLayer, ambientationYearList1, ambientationYearList2 } = getHistogramElements(page);

  await page.goto('https://auravant.auravant.com/view');

  // Solo el flujo de histogramas, sin login
  await farm.click();
  await farmName.fill('adm');
  await selectFarm.click();
  await selectfield.click();
  await toggleSidenav.click();
  await validateHistogram();
  await validateAmbientationSurface();

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

}

    console.log(`✅ Completado: Se hizo click en ${numbersToClick.length} números (2-7) del histograma`);

  }

// Generar la validación del ambientacion en la superficie del histograma
async function validateAmbientationSurface() {
  await ambientactionContainer.click();

  await expect(ambientationYearList).toBeVisible();
  await ambientationYearList.click();
  console.log(`✅ Se hizo click en Ambientación y la fecha`);

  await ambientationCurrentLayer.click();
  console.log(`✅ Se hizo click en Agregar capa actual`);

  await ambientationButtonContinue.click();
  console.log(`✅ Se hizo click en el botón Continuar`);

  await page.waitForTimeout(2000);
  // Validar que la superficie haya cambiado
  await expect(ambientationSurface1).toBeVisible();
  const SurfaceBefore1 = await ambientationSurface1.innerText();

  await page.waitForTimeout(2000);
  await expect(ambientationSurface2).toBeVisible();
  const SurfaceBefore2 = await ambientationSurface2.innerText();
  // console.log(`Superficie 1: ${SurfaceBefore1} - Superficie 2: ${SurfaceBefore2}`);
  expect(SurfaceBefore1).not.toBe(SurfaceBefore2);
  console.log(`✅ La superficie de ambientación ha sido guardada correctamente.`);

  // Validar que el botón de "Cerrar" esté visible y hacer clic en él
  await expect(ambientationButtonBack).toBeVisible();
  await ambientationButtonBack.click();
  console.log(`✅ Se hizo click en el botón Volver`);

  // Esperar que este botón sea visible nuevamente y hacer clic en él
  await ambientactionContainer.click();
  console.log(`✅ Se hizo click en Ambientación nuevamente`);

  await expect(ambientationDeleteLayer).toBeVisible();
  await ambientationDeleteLayer.click();
  console.log(`✅ Se hizo click en el ícono de eliminar capa`);
  
  // Seleccionar dos fechas diferentes para validar que la superficie sea diferente
  await expect(ambientationYearList1).toBeVisible();
  await ambientationYearList1.click();
  console.log(`✅ Se hizo click en Ambientación y la fecha nuevamente`);

  await ambientationCurrentLayer.click();
  console.log(`✅ Se hizo click en Agregar capa actual nuevamente`);

  await ambientationYearList2.click();
  console.log(`✅ Se hizo click en otra fecha diferente`);

  await ambientationCurrentLayer.click();
  console.log(`✅ Se hizo click en Agregar capa actual nuevamente`);

  await ambientationButtonContinue.click();
  console.log(`✅ Se hizo click en el botón Continuar nuevamente`);

  await page.waitForTimeout(2000);

  // Guardar el valor de la superficie después de cerrar
  await expect(ambientationSurface1).toBeVisible();
  const SurfaceAfter1 = await ambientationSurface1.innerText();

  await page.waitForTimeout(2000);

  await expect(ambientationSurface2).toBeVisible();
  const SurfaceAfter2 = await ambientationSurface2.innerText();

  // console.log(`Superficie después de cerrar 1: ${SurfaceAfter1} - Superficie después de cerrar 2: ${SurfaceAfter2}`);
  console.log(`📊 Comparación de superficies:`);
  console.log(`   Antes - Superficie 1: ${SurfaceBefore1} | Superficie 2: ${SurfaceBefore2}`);
  console.log(`   Después - Superficie 1: ${SurfaceAfter1} | Superficie 2: ${SurfaceAfter2}`);
  expect(SurfaceAfter1).not.toBe(SurfaceBefore1);
  expect(SurfaceAfter2).not.toBe(SurfaceBefore2);
  console.log(`✅ La superficie de ambientación es diferente después de cerrar y volver a abrir el histograma.`);

  console.log(`✅ Validación de ambientación completada correctamente.`);
}

}