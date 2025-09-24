# NodejsPlaywright - Pruebas Automatizadas Auravant

Este proyecto contiene pruebas automatizadas con Playwright para la plataforma Auravant, incluyendo flujos como login, clima, histogramas y validaciones de forecast y rainlog.

---

## Requisitos

- Node.js 18.x o superior
- npm
- Acceso a un token de autenticación válido (`com.auravant.auth`)

---

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://gitlab.com/<TU_USUARIO>/<TU_REPO>.git
   cd <TU_REPO>
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Instala los navegadores de Playwright:**

   ```bash
   npx playwright install
   ```

---

## Configuración

1. **Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:**

   ```
   USER_TOKEN=tu_token_de_cookie
   DOMAIN=auravant.com
   ```

   - El valor de `USER_TOKEN` debe ser el valor real de la cookie `com.auravant.auth` obtenida tras iniciar sesión manualmente.
   - Puedes ajustar `DOMAIN` si tu entorno lo requiere.

---

## Estructura del Proyecto

```
tests/
  ├── Histogram/
  │     ├── index.spec.ts
  │     └── utils/
  │           └── histogram.ts
  ├── Login/
  │     └── index.spec.ts
  ├── weather/
  │     ├── index.spec.ts
  │     └── utils/
  │           ├── forecast.ts
  │           ├── rainlog.ts
  │           └── constants/
  │                 └── regex.ts
  └── main.spec.ts
.env
playwright.config.ts
package.json
```

---

## Ejecución de Pruebas

### Scripts disponibles

- **Ejecutar todos los tests principales:**
  ```bash
  npm start
  ```

- **Ejecutar los tests principales con la interfaz interactiva de Playwright:**
  ```bash
  npm run start-default
  ```

- **Crear una nueva estructura de test:**
  ```bash
  npm run create-test
  ```

- **Regenerar el archivo main.spec.ts automáticamente:**
  ```bash
  npm run restart-main
  ```

---

### Ejemplo de ejecución avanzada

Puedes combinar los scripts con argumentos de Playwright.  
Por ejemplo, para ejecutar solo el test `auraview.histogram.validateElementsAndData` en el proyecto `webkit` y con la interfaz interactiva:

```bash
npm start -- -g 'auraview.histogram.validateElementsAndData' --project=webkit --ui
```

---

## Notas

- El flujo de autenticación se realiza mediante la cookie `com.auravant.auth` agregada automáticamente desde la variable de entorno `USER_TOKEN`.
- Si tu token expira, deberás actualizarlo en el archivo `.env`.
- No subas el archivo `.env` al repositorio (ya está en `.gitignore`).
- Puedes modificar o agregar nuevos flujos en la carpeta `tests/`.

---

## Contacto

Para dudas o soporte, contacta al equipo de QA o desarrollo