#!/usr/bin/env bash
# OpenAPI gate: lint canonical spec. Fails if invalid.
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPEC="${ROOT}/docs/04-api/openapi.yaml"
if [ ! -f "$SPEC" ]; then
  echo "OpenAPI spec not found: $SPEC"
  exit 1
fi
echo "Linting $SPEC..."
npx --yes @redocly/cli lint "$SPEC"
echo "OpenAPI lint OK."
# Optional: generate bundle
if [ "${OPENAPI_BUNDLE:-0}" = "1" ]; then
  npx --yes @redocly/cli bundle "$SPEC" -o "${ROOT}/docs/04-api/openapi.bundle.yaml"
  echo "Bundle written to docs/04-api/openapi.bundle.yaml"
fi
