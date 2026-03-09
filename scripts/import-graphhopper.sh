#!/usr/bin/env bash
# Import PBF into GraphHopper (i Docker).
# Forventer: docker compose med graphhopper service (profile 'full'), PBF i data/
# Efter import: genstart graphhopper med 'web -d /data' – typisk ved container restart.
# Light mode: Hvis GraphHopper ikke kører eller ingen PBF, skipper scriptet med TODO.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="${DATA_DIR:-$ROOT_DIR/data}"
PBF_FILE="${DATA_DIR}/denmark-latest.osm.pbf"
CONTAINER_NAME="${CONTAINER_NAME:-ezroot-graphhopper-1}"

if [ ! -f "$PBF_FILE" ]; then
  echo "TODO: PBF ikke fundet ($PBF_FILE). Kør scripts/download-pbf.sh først, eller brug light mode (API returnerer 503 for routes)."
  exit 0
fi

if ! docker ps --format '{{.Names}}' | grep -q graphhopper; then
  echo "TODO: Start GraphHopper med: docker compose -f infra/docker-compose.yml --profile full up -d graphhopper"
  echo "Kopier derefter PBF ind og kør graphhopper import i containeren."
  exit 0
fi

# Find graphhopper container
CONTAINER=$(docker ps --filter "name=graphhopper" --format "{{.Names}}" | head -1)
if [ -z "$CONTAINER" ]; then
  echo "GraphHopper container kører ikke. Light mode: spring over."
  exit 0
fi

echo "Kopierer PBF til container..."
docker cp "$PBF_FILE" "$CONTAINER:/data/denmark-latest.osm.pbf"
echo "Kører graphhopper import (kan tage mange minutter)..."
docker exec "$CONTAINER" graphhopper import /data/denmark-latest.osm.pbf /data
echo "Import færdig. Genstart container for at serve graf: docker restart $CONTAINER"
