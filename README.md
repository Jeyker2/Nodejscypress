# NodeJS Playwright Tests

## Estructura del Proyecto

```
NodejsPlaywrigt/
├── tests/
│   ├── main.spec.ts                    # Archivo principal de tests
│   ├── 01-testlogin/
│   │   └── loginPage.spec.ts          # Test de login
│   └── 02-weather/
│       └── weatherPage.spec.ts        # Test de clima
├── playwright.config.ts               # Configuración de Playwright
├── package.json                       # Dependencias del proyecto
└── .env                              # Variables de entorno
```

## Instalación

```bash
npm install
```

## Variables de Entorno

Crear archivo `.env` con:

```
USER_EMAIL=tu_email@ejemplo.com
USER_PASSWORD=tu_contraseña
USER_TOKEN=tu_token_de_autenticacion
DOMAIN=auravant.com
```

## Ejecución de Tests

### Ejecutar en browser específico:
```bash
# Chromium
npx playwright test --project=chromium tests/main.spec.ts

# Firefox
npx playwright test --project=firefox tests/main.spec.ts

# Safari/WebKit
npx playwright test --project=webkit tests/main.spec.ts
```

### Ejecutar en todos los browsers:
```bash
npx playwright test tests/main.spec.ts
```

### Ejecutar tests individuales:
```bash
# Solo login
npx playwright test -g "Ejecutar testLogin"

# Solo weather
npx playwright test -g "auraview.weather.forescast.fecha"
```

## Tests Disponibles

- **testLogin**: Automatiza el proceso de login en la plataforma
- **testWeather**: Navega por la sección de clima y registro de lluvias