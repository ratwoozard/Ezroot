#!/usr/bin/env node
/**
 * Run SQL migrations from infra/migrations in order.
 * Loads .env from repo root if DATABASE_URL not set. No ORM; raw pg.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const ROOT = path.resolve(__dirname, '..');
const MIGRATIONS_DIR = path.join(ROOT, 'infra', 'migrations');

// Altid læs DATABASE_URL fra repo-root .env (én kilde, overskriver process.env)
const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (key === 'DATABASE_URL') process.env[key] = val;
  }
}

function parseDbUrlRedacted(url) {
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
  console.log('[migrations] DATABASE_URL (redacted):', JSON.stringify(redacted, null, 2));

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error('Migrations dir not found:', MIGRATIONS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No .sql files in infra/migrations');
    return;
  }

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

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    for (const file of files) {
      const name = path.basename(file, '.sql');
      const res = await client.query(
        'SELECT 1 FROM _migrations WHERE name = $1',
        [name]
      );
      if (res.rowCount > 0) {
        console.log('Skip (already applied):', file);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
        await client.query('COMMIT');
        console.log('Applied:', file);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
