# Proceso para crear nuevos tests

Sigue estos pasos para crear y ejecutar nuevos tests en este proyecto:

1. **Crear la estructura del nuevo test**
   
   Ejecuta:
   ```sh
   npm run create-test
   ```
   Esto te pedirá el nombre del test y generará la estructura base en la carpeta `test/<NOMBRE_TEST>`.

2. **Agregar funciones en utils**
   
   Implementa las funciones necesarias en el archivo:
   ```
   test/<NOMBRE_TEST>/utils/testExample.ts
   ```

3. **Definir nombre de regex en constants**
   
   Declara el nombre del regex en:
   ```
   test/<NOMBRE_TEST>/constants/regex.ts
   ```

4. **Agregar métodos test en index.spec.ts**
   
   Escribe los métodos de test en:
   ```
   test/<NOMBRE_TEST>/index.spec.ts
   ```

5. **Probar el test**
   
   Ejecuta:
   ```sh
   npm start -- -g <REGEX_TEST>
   ```
   Reemplaza `<REGEX_TEST>` por el nombre del regex definido en el paso 3.

---

> Si necesitas regenerar el archivo `tests/main.spec.ts` para importar automáticamente todos los tests, ejecuta:
> ```sh
> ./scripts/regenerate_main_spec.sh
> ```
