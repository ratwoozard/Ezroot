# EzRoot – lokale kommandoer
# Forventer: pnpm install kørt, infra/.env og evt. .env sat

.PHONY: db-migrate seed test import-dk install infra-up infra-down

install:
	pnpm install

infra-up:
	docker compose -f infra/docker-compose.yml up -d

infra-down:
	docker compose -f infra/docker-compose.yml down

# Migrationer: kør fra repo root; forventer DATABASE_URL (infra/migrations)
db-migrate:
	node scripts/run-migrations.js

# Seed: kræver apps/api (Batch 3+)
seed:
	pnpm -C apps/api run seed:run

# Tests
test:
	pnpm run test

# Import DK: download PBF + GraphHopper + osm2pgsql (eller light fallback)
# Kræver: DATA_DIR, PBF_URL_DK, evt. infra/.env
import-dk:
	@echo "Kører import-dk (PBF download, GraphHopper, osm2pgsql)..."
	@bash scripts/download-pbf.sh
	@bash scripts/import-graphhopper.sh
	@bash scripts/import-osm2pgsql.sh
