#!/usr/bin/env bash
# Import OSM PBF into PostGIS med osm2pgsql (til Martin tiles).
# Kræver: osm2pgsql på host ELLER brug af osm2pgsql-container.
# DATABASE_URL fra infra/.env eller miljø.
# Light mode: Hvis osm2pgsql ikke findes eller DB ikke klar, TODO og exit 0.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="${DATA_DIR:-$ROOT_DIR/data}"
PBF_FILE="${DATA_DIR}/denmark-latest.osm.pbf"

if [ ! -f "$PBF_FILE" ]; then
  echo "TODO: PBF ikke fundet ($PBF_FILE). Kør scripts/download-pbf.sh først."
  exit 0
fi

# DATABASE_URL for app-db; Martin kan bruge samme PostGIS eller separat schema
if [ -z "$DATABASE_URL" ]; then
  if [ -f "$ROOT_DIR/infra/.env" ]; then
    set -a
    source "$ROOT_DIR/infra/.env"
    set +a
  fi
fi
DATABASE_URL="${DATABASE_URL:-postgres://app:secret@localhost:5432/appdb}"

if ! command -v osm2pgsql &>/dev/null; then
  echo "TODO: osm2pgsql ikke installeret. Installer osm2pgsql eller brug Docker-baseret import."
  echo "Martin vil køre men uden OSM-tiles indtil PostGIS har tile-tabeller."
  exit 0
fi

echo "Importerer $PBF_FILE til PostGIS (osm2pgsql --slim). Kan tage lang tid..."
# -O flex: kræver .lua schema; ellers brug default pgsql
# Projektet kan levere infra/osm2pgsql.lua senere
osm2pgsql -d "$DATABASE_URL" \
  --slim -C 8000 \
  --extra-attributes \
  "$PBF_FILE"

echo "osm2pgsql import færdig. Tjek at Martin kan serve tiles fra PostGIS."
