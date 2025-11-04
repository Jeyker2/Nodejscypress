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

  const { farm, farmName, selectFarm, selectfield, sidenavButton, headerSidenav, pageTitle, helpButton } = getuserInterfaceElements(page);

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

}