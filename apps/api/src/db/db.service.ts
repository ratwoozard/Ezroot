import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { ConfigService } from '../config/config.service';

const SET_TENANT_SQL = `SET LOCAL app.current_org_id = $1`;

@Injectable()
export class DbService implements OnModuleDestroy {
  private pool: Pool;

  constructor(private config: ConfigService) {
    const url = this.config.databaseUrl;
    const isSupabase = url.includes('supabase.com');
    const connectionString = isSupabase
      ? url.replace(/\?sslmode=[^&]*&?/, '?').replace(/&sslmode=[^&]*/, '').replace(/\?$/, '') || url
      : url;
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      ...(isSupabase && { ssl: { rejectUnauthorized: false } }),
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Run callback in a transaction. No tenant context; use for register (org + user create).
   */
  async runInTransaction<T>(
    fn: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK').catch(() => {});
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Run callback with tenant context: SET LOCAL app.current_org_id before any query.
   * Use for all tenant-scoped operations (me, vehicle_profiles, etc.).
   */
  async runInTenant<T>(
    orgId: string,
    fn: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query(SET_TENANT_SQL, [orgId]);
      return await fn(client);
    } finally {
      client.release();
    }
  }

  /** Simple query for health check (no tenant). */
  async healthCheck(): Promise<boolean> {
    const client = await this.getClient();
    try {
      const res = await client.query('SELECT 1 as ok');
      return res.rows[0]?.ok === 1;
    } finally {
      client.release();
    }
  }
}
