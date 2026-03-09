/**
 * Seed script: 2 orgs, 2 users, vehicle profiles, saved places, saved routes.
 * Run: pnpm -C apps/api run seed:run (or make seed).
 * Requires: DATABASE_URL, migrations applied.
 *
 * Seed credentials (same password for all): seed-pass-123
 * - Org A: admin@org-a.dk / seed-pass-123
 * - Org B: admin@org-b.dk / seed-pass-123
 */

const path = require('path');
const fs = require('fs');
// Load .env from repo root (seed run from apps/api/src/seed → ../../../../ = root)
const rootEnv = path.resolve(__dirname, '../../../../.env');
if (fs.existsSync(rootEnv)) {
  const raw = fs.readFileSync(rootEnv, 'utf8').replace(/\r\n/g, '\n');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) process.env[key] = val;
  }
}

const { Client } = require('pg');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const SEED_PASSWORD = 'seed-pass-123';

function parseDbUrlRedacted(url: string) {
  try {
    const u = new URL(url);
    const auth = u.username || '';
    return {
      host: u.hostname,
      port: u.port || '5432',
      database: (u.pathname || '').replace(/^\//, '') || 'postgres',
      username: auth ? `${auth.slice(0, 12)}${auth.length > 12 ? '...' : ''}` : '(none)',
      usernameShape: auth.startsWith('postgres.') ? 'postgres.[PROJECT_REF]' : auth ? 'other' : '(none)',
      hasSslmodeRequire: (u.search || '').toLowerCase().includes('sslmode=require'),
    };
  } catch (e) {
    return { parseError: String(e.message) };
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const redacted = parseDbUrlRedacted(databaseUrl);
  console.log('[seed] DATABASE_URL (redacted):', JSON.stringify(redacted, null, 2));

  // pg overwrites ssl when connectionString has sslmode=*; use URL without sslmode so ssl option wins (Supabase cert)
  const isSupabase = databaseUrl.includes('supabase.com');
  const connectionString = isSupabase
    ? databaseUrl.replace(/\?sslmode=[^&]*&?/, '?').replace(/&sslmode=[^&]*/, '').replace(/\?$/, '') || databaseUrl
    : databaseUrl;
  const client = new Client({
    connectionString,
    ...(isSupabase && { ssl: { rejectUnauthorized: false } }),
  });
  await client.connect();

  const hash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

  try {
    // Org A
    let orgAId = (await client.query(`SELECT id FROM organizations WHERE name = 'Org A' LIMIT 1`)).rows[0]?.id;
    if (!orgAId) {
      orgAId = (await client.query(`INSERT INTO organizations (name) VALUES ('Org A') RETURNING id`)).rows[0]?.id;
    }
    if (orgAId) {
      await client.query('SET LOCAL app.current_org_id = $1', [orgAId]);
      await client.query(
        `INSERT INTO users (org_id, email, password_hash, name, role) VALUES ($1, $2, $3, 'Admin A', 'admin')
         ON CONFLICT (org_id, email) DO NOTHING`,
        [orgAId, 'admin@org-a.dk', hash]
      );
      const vpA = await client.query(
        `INSERT INTO vehicle_profiles (org_id, name, length, width, height, weight, axles, hazardous_material)
         VALUES ($1, 'Lastbil A', 8, 2.5, 3.5, 12000, 3, false) RETURNING vehicle_id`,
        [orgAId]
      );
      const vehicleAId = vpA.rows[0]?.vehicle_id;
      await client.query(
        `INSERT INTO saved_places (org_id, name, address, lat, lon) VALUES ($1, 'Lager A', 'Adresse 1', 55.68, 12.57)`,
        [orgAId]
      );
      if (vehicleAId) {
        await client.query(
          `INSERT INTO saved_routes (org_id, name, vehicle_id, origin, destination, geometry, distance_km, duration_min)
           VALUES ($1, 'Rute A1', $2, '55.68,12.57', '55.69,12.58', $3::jsonb, 15.5, 25)`,
          [orgAId, vehicleAId, JSON.stringify([[12.57, 55.68], [12.58, 55.69]])]
        );
      }
    }

    // Org B
    let orgBId = (await client.query(`SELECT id FROM organizations WHERE name = 'Org B' LIMIT 1`)).rows[0]?.id;
    if (!orgBId) {
      orgBId = (await client.query(`INSERT INTO organizations (name) VALUES ('Org B') RETURNING id`)).rows[0]?.id;
    }
    if (orgBId) {
      await client.query('SET LOCAL app.current_org_id = $1', [orgBId]);
      await client.query(
        `INSERT INTO users (org_id, email, password_hash, name, role) VALUES ($1, $2, $3, 'Admin B', 'admin')
         ON CONFLICT (org_id, email) DO NOTHING`,
        [orgBId, 'admin@org-b.dk', hash]
      );
      const vpB = await client.query(
        `INSERT INTO vehicle_profiles (org_id, name, length, width, height, weight, axles, hazardous_material)
         VALUES ($1, 'Varevogn B', 5, 2, 2.5, 3500, 2, false) RETURNING vehicle_id`,
        [orgBId]
      );
      const vehicleBId = vpB.rows[0]?.vehicle_id;
      await client.query(
        `INSERT INTO saved_places (org_id, name, lat, lon) VALUES ($1, 'Depot B', 55.70, 12.60)`,
        [orgBId]
      );
      if (vehicleBId) {
        await client.query(
          `INSERT INTO saved_routes (org_id, name, vehicle_id, origin, destination, geometry, distance_km, duration_min)
           VALUES ($1, 'Rute B1', $2, '55.70,12.60', '55.71,12.61', $3::jsonb, 8, 12)`,
          [orgBId, vehicleBId, JSON.stringify([[12.6, 55.7], [12.61, 55.71]])]
        );
      }
    }

    console.log('Seed done.');
    console.log('Login: admin@org-a.dk / seed-pass-123  eller  admin@org-b.dk / seed-pass-123');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
