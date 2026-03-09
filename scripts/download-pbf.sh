#!/usr/bin/env bash
# Download OSM PBF for Denmark (Geofabrik).
# Miljø: DATA_DIR (default: data), PBF_URL_DK (default: denmark-latest)
# Output: $DATA_DIR/denmark-latest.osm.pbf

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="${DATA_DIR:-$ROOT_DIR/data}"
PBF_URL_DK="${PBF_URL_DK:-https://download.geofabrik.de/europe/denmark-latest.osm.pbf}"
PBF_FILE="${DATA_DIR}/denmark-latest.osm.pbf"

mkdir -p "$DATA_DIR"
if [ -f "$PBF_FILE" ]; then
  echo "PBF findes allerede: $PBF_FILE (slet filen for at hente igen)"
  exit 0
fi
echo "Henter $PBF_URL_DK til $PBF_FILE ..."
curl -L -o "$PBF_FILE" "$PBF_URL_DK"
echo "Færdig: $PBF_FILE"
