#!/bin/sh

# Script para regenerar tests/main.spec.ts importando todos los index.spec.ts de subdirectorios en test/*

MAIN_SPEC="tests/main.spec.ts"

# Borra el contenido del archivo
> "$MAIN_SPEC"

echo "import 'dotenv/config'" >> "$MAIN_SPEC"

echo "" >> "$MAIN_SPEC"


for dir in tests/*; do
  if [ -d "$dir" ] && [ -f "$dir/index.spec.ts" ]; then
    DIR_NAME=$(basename "$dir")
    echo "import '../$dir/index.spec.ts'" >> "$MAIN_SPEC"
  fi
done

echo "Archivo $MAIN_SPEC regenerado con imports de todos los index.spec.ts en test/*/"
