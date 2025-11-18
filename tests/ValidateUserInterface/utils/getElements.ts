import { Page } from '@playwright/test';
import { text } from 'stream/consumers';

export function getuserInterfaceElements(page: Page) {
  // Funciones helpers para obtener elementos de la interfaz de usuario
  return {
    // Selectores Campo/Lote
    farm: page.getByRole('textbox', { name: 'Buscar campo o lote' }),
    farmName: page.getByRole('textbox', { name: 'Buscar campo o lote' }),
    selectFarm: page.getByText('test admin').first(),
    selectfield: page.getByText('Admin 1').first(),

    // Selector del botón de Sidenav
    sidenavButton: page.locator('[aura-test="toggle-sidenav-button"]').first(),
    headerSidenav: page.locator('#root'),
    
    // Selector del título de la página
    pageTitle: page.getByRole('heading', { name: 'Título de la página' }),
    // Selector del botón de ayuda
    helpButton: page.getByRole('button', { name: 'Ayuda' }),

    // Carrusel de fechas
    dateCarousel: page.locator('.dates-selector .days-list .day-list-carousel').first(),
  };
  
}