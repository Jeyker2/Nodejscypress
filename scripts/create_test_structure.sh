# Uso: ./create_test NOMBRE_TEST

if [ -z "$1" ]; then
	echo "Uso: $0 NOMBRE_TEST"
	exit 1
fi

NOMBRE_TEST="$1"
DEST="tests/$NOMBRE_TEST"

mkdir -p "$DEST/constants"
mkdir -p "$DEST/utils"

# Copiar el contenido de los archivos de template/Feature
cp "template/Feature/index.spec.ts" "$DEST/index.spec.ts"
cp "template/Feature/constants/regex.ts" "$DEST/constants/regex.ts"
cp "template/Feature/utils/testExample.ts" "$DEST/utils/testExample.ts"


echo "Estructura creada en $DEST/ con archivos inicializados desde template/Feature."

# Ejecutar el script para regenerar tests/main.spec.ts
sh scripts/regenerate_main_spec.sh
