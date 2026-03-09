#!/usr/bin/env node
/**
 * Set Supabase project database password via Management API.
 * Requires: SUPABASE_ACCESS_TOKEN in env (from https://supabase.com/dashboard/account/tokens).
 * Usage: SUPABASE_ACCESS_TOKEN=your_token node scripts/set-supabase-db-password.js
 */
const PROJECT_REF = 'stqcvarknctewxpqqaon';
const PASSWORD = '0bopiD9UNneMY99l';

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error('Set SUPABASE_ACCESS_TOKEN (from https://supabase.com/dashboard/account/tokens)');
    process.exit(1);
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password: PASSWORD }),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error('Failed:', res.status, t);
    process.exit(1);
  }

  const data = await res.json().catch(() => ({}));
  console.log('Database password updated.');
  console.log('Run: node scripts/run-migrations.js');
}

main();
