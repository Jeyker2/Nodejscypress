import {BrowserContext, expect, Page} from '@playwright/test';
import { getuserInterfaceElements } from './getElements';

export async function testValidateUserInterface(page: Page, context: BrowserContext) {

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

  const { farm, farmName, selectFarm, selectfield, sidenavButton, headerSidenav, dateCarousel, pageTitle, helpButton } = getuserInterfaceElements(page);

  // Logica para probar la interfaz de usuario
  await page.goto('https://auravant.auravant.com/view');


  // Solo el flujo de validación de la interfaz de usuario, sin login
  await validateSideNav();
  await expect(farm).toBeVisible();
  await farm.click();
  await expect(farmName).toBeVisible();
  await farmName.fill('adm');
  await clickSelectFarm();
  await clickSelectField();
  await validateDateCarousel();

  // Validaciones filtros Campo/Lote
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

async function validateSideNav() {

  // Esperar y validar el botón de Sidenav
  await page.waitForTimeout(5000);
  await expect(sidenavButton).toBeVisible();
  console.log('✅ Botón de Sidenav visible');
  await sidenavButton.click();

  // Validar que el Sidenav se haya abierto
  const header = headerSidenav;
  const body = headerSidenav;

  await page.waitForTimeout(5000);
  await expect(header).toBeVisible();
  await expect(header).toMatchAriaSnapshot(`
  - img
  - text: Extensiones
  - img  
  - text: Actividades
  - img
  - text: Histograma
`);
  console.log('✅ Header del Sidenav cargado correctamente');

  await expect(body).toBeVisible();
  await expect(body).toMatchAriaSnapshot(`
    - img
    - text: Análisis
    - img
    - img
    - text: Recomendador
    - img
    - text: Histograma
    - img
    - text: Ambientación
    - img
    - text: Mis Mapas
    - img
    - text: Estado del cultivo
    - img
    - text: Sensores
    - img
    - img
    - text: Vista Multicapa
    - img "Sustentabilidad ambiental"
    - text: Sustentabilidad ambiental
    - img "Telefónica IoT"
    - text: Telefónica IoT
    - img
    - img "Ahorcado"
    - text: Ahorcado
    - img "Fede Pulverizadores"
    - text: Fede Pulverizadores
    - img "John Deere Operations Center"
    - text: John Deere Operations Center
    - img "Recomendador"
    - text: Recomendador
    - img "Cool Farm Tool"
    - text: Cool Farm Tool
    - img "Plena"
    - text: Plena
    - img "Scandrop by AgroSpray"
    - text: Scandrop by AgroSpray
    - img "Ensayos"
    - text: Ensayos
    - img "Gestión de ensayos - Rizobacter"
    - text: Gestión de ensayos - Rizobacter
    - img "Metos"
    - text: Metos
    - img
    - text: Gestión
    - img
    - img
    - text: Rotaciones
    - img
    - text: Actividades
    - img
    - text: Planificación
    - img
    - text: Órdenes de trabajo
    - img
    - text: Stocks
    - img
    - text: Feed
    - img
    - text: Relevamientos
    - img
    - img
    - text: Marcadores
    - img
    - text: Muestreos
    - img
    - text: Mis rutas
    - img
    - text: Clima
    - img
    - img
    - text: Pronóstico
    - img
    - text: Registro de lluvias
    - img
    - text: Recursos
    - img
    - text: Empresas
    - img
    - text: Personas
    - img
    - text: Maquinarias
    - img
    - text: Proveedores
    - img
    - text: Reportes
    - img
    - img
    - text: Reporte
    - img
    - text: Reporte terrapro
    - img "Informes Nidera"
    - text: Informes Nidera
    - img "Reportes de muestreo"
    - text: Reportes de muestreo
    `);
  console.log('✅ Body del Sidenav cargado correctamente');
}

async function validateDateCarousel() {
  const today = new Date();

  // Convertir fecha actual a formato YYYY-MM-DD para comparaciones
  const todayStr = today.toISOString().split('T')[0];
  const fiveDaysAgo = new Date(today.getTime() - (5 * 24 * 60 * 60 * 1000));
  const tenDaysAgo = new Date(today.getTime() - (10 * 24 * 60 * 60 * 1000));
  
  await page.waitForTimeout(5000);
  await expect(dateCarousel).toBeVisible();
  
  const datesText = await dateCarousel.textContent();
  
  // Expresión regular para encontrar patrones: Mes Días Año
  const regex = /([A-Za-z]{3})\s+([\d\s]+)\s+(\d{4})/g;
  const matches = [...datesText!.matchAll(regex)]; // Buscar todas las coincidencias del patrón en el texto
  
  // Array para almacenar las fechas procesadas
  const dates = [];
  // Iterar sobre cada coincidencia encontrada
  for (const match of matches) {
    const [, month, daysStr, year] = match;
    const days = daysStr.trim().match(/\d{2}/g) || [];
    

    // Procesar cada día encontrado
    for (const day of days) {
      const date = new Date(`${month} ${day}, ${year}`);
      if (!isNaN(date.getTime())) {
        dates.push(date);
      }
    }
  }
  
  // Ordenar fechas de más antigua a más reciente
  dates.sort((a, b) => a.getTime() - b.getTime());

  // Mostrar lista ordenada
  // console.log('📅 Lista de fechas ordenadas:');
  // dates.forEach((date, index) => {
  //   console.log(`${index + 1}. ${date.toISOString().split('T')[0]} (${date.toLocaleDateString()})`);
  // });
  
  // Validar fecha actual
  const hasToday = dates.some(date => 
    date.toISOString().split('T')[0] === todayStr
  );
  
  if (hasToday) {
    console.log('✅ Fecha actual encontrada en el carrusel');
  } else {
    // Validar rango de 5-10 días anteriores
    const hasValidRange = dates.some(date => 
      date >= tenDaysAgo && date <= fiveDaysAgo
    );
    
    // Validar que existan fechas en el rango válido
    expect(hasValidRange, 'Debe tener fechas en rango de 5-10 días anteriores').toBeTruthy();
    console.log('✅ Fechas válidas en rango de 5-10 días anteriores');
  }
}

}