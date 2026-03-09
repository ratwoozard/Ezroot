#!/usr/bin/env bash
# OpenAPI sync: copy canonical spec from docs to packages (if used).
# In freeze phase canonical remains docs/04-api/openapi.yaml.
# Run this only when you want to publish a copy to packages/openapi for codegen.
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CANONICAL="${ROOT}/docs/04-api/openapi.yaml"
TARGET="${ROOT}/packages/openapi/openapi.yaml"
if [ ! -f "$CANONICAL" ]; then
  echo "Canonical not found: $CANONICAL"
  exit 1
fi
mkdir -p "$(dirname "$TARGET")"
cp "$CANONICAL" "$TARGET"
echo "Synced $CANONICAL -> $TARGET"
