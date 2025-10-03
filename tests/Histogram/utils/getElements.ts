import { expect, Page } from "@playwright/test";

export function getHistogramElements(page: Page) {

    // Función helper para elementos comunes
    return {
        // Selectores Campo/Lote
        farm: page.getByRole('textbox', { name: 'Buscar campo o lote' }),
        farmName: page.getByRole('textbox', { name: 'Buscar campo o lote' }),
        selectFarm: page.getByText('test admin').first(),
        selectfield: page.getByText('Admin 1').first(),

        // Elemento toggle-sidenav
        toggleSidenav: page.locator('[aura-test="toggle-sidenav-button"]').first(),

        // Elementos del histograma
        histogramContainer: page.locator('span').filter({ hasText: 'Histograma' }),
        // histogramCantidad: page.getByText(number, { exact: true }),
        histogramCantidad: (number: string) => page.getByText(number, { exact: true }).first(),
        histogramTooltip: page.locator('[data-testid="histogram-tooltip"]'),

        // Suma dinamica de las cantidades del histograma
        haElements: page.locator("[aura-test='content-layout'] div ").filter({ hasText: /ha$/ }),
        totalText: page.locator('.state-bottom-bar-container div:nth-child(2) > div.value').filter({ hasText: /ha$/ }),

        // validar superficies iniciales ambientacion
        ambientactionContainer: page.getByText('Ambientación'),
        ambientationYearList: page.locator('div:nth-child(11) > .year-list > div:nth-child(9) > .month-list > div:nth-child(7) > .value > .day'),
        ambientationYearList1: page.locator('div:nth-child(11) > .year-list > div:nth-child(9) > .month-list > div:nth-child(4) > .value > .day'),
        ambientationYearList2: page.locator('div:nth-child(11) > .year-list > div:nth-child(9) > .month-list > div:nth-child(5) > .value > .day'),
        ambientationCurrentLayer: page.getByRole('button', { name: 'Agregar capa actual' }),
        ambientationDeleteLayer: page.locator('#arch__feature--body img'),
        ambientationButtonContinue: page.getByRole('button', { name: 'Continuar' }),
        ambientationButtonBack: page.locator('[aura-test="windowCloseIcon"]'),
        // ambientationButtonBack: page.getByRole('button', { name: 'Volver' }),
        ambientationSurface1: page.locator("[aura-test='content-layout'] div:nth-child(8) > div:nth-child(1)"),
        ambientationSurface2: page.locator("[aura-test='content-layout'] div:nth-child(8) > div:nth-child(2)"),

    };
}
