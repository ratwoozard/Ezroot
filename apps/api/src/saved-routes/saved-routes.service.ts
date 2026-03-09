import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { AuditService } from '../audit/audit.service';
import { ERROR_CODES } from '@ezroot/shared';
import { SavedRouteInputDto } from './dto/saved-route-input.dto';

@Injectable()
export class SavedRoutesService {
  constructor(
    private db: DbService,
    private audit: AuditService,
  ) {}

  async list(orgId: string, page: number, limit: number, search?: string) {
    const offset = (page - 1) * limit;
    const searchTerm = search?.trim();
    const hasSearch = !!searchTerm;
    const [rows, countRes] = await this.db.runInTenant(orgId, async (client) => {
      const listParams = hasSearch ? [limit, offset, `%${searchTerm}%`] : [limit, offset];
      const r = await client.query(
        hasSearch
          ? `SELECT route_id, name, vehicle_id, distance_km, duration_min, geometry FROM saved_routes WHERE name ILIKE $3 ORDER BY created_at DESC LIMIT $1 OFFSET $2`
          : `SELECT route_id, name, vehicle_id, distance_km, duration_min, geometry FROM saved_routes ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        listParams,
      );
      const c = await client.query(
        hasSearch
          ? `SELECT COUNT(*)::int AS total FROM saved_routes WHERE name ILIKE $1`
          : `SELECT COUNT(*)::int AS total FROM saved_routes`,
        hasSearch ? [`%${searchTerm}%`] : [],
      );
      return [r.rows, c.rows[0].total] as const;
    });
    return {
      items: rows.map((row: Record<string, unknown>) => ({
        route_id: row.route_id as string,
        name: row.name as string,
        vehicle_id: row.vehicle_id as string,
        distance_km: row.distance_km != null ? parseFloat(String(row.distance_km)) : undefined,
        duration_min: row.duration_min != null ? parseFloat(String(row.duration_min)) : undefined,
        geometry: (row.geometry as number[][]) ?? [],
      })),
      totalCount: countRes,
    };
  }

  async create(orgId: string, userId: string, dto: SavedRouteInputDto) {
    const geometry = Array.isArray(dto.geometry) && dto.geometry.length > 0
      ? JSON.stringify(dto.geometry)
      : JSON.stringify([]);
    const row = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `INSERT INTO saved_routes (org_id, name, vehicle_id, origin, destination, waypoints, geometry, distance_km, duration_min)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
         RETURNING route_id, name, vehicle_id, distance_km, duration_min, geometry`,
        [
          orgId,
          dto.name,
          dto.vehicleId,
          dto.origin ?? null,
          dto.destination ?? null,
          dto.waypoints ? JSON.stringify(dto.waypoints) : null,
          geometry,
          dto.distance_km ?? null,
          dto.duration_min ?? null,
        ],
      );
      return r.rows[0];
    });
    await this.audit.log(orgId, userId, 'create', 'saved_route', row.route_id, { name: dto.name });
    return {
      route_id: row.route_id,
      name: row.name,
      vehicle_id: row.vehicle_id,
      distance_km: row.distance_km != null ? parseFloat(row.distance_km) : undefined,
      duration_min: row.duration_min != null ? parseFloat(row.duration_min) : undefined,
      geometry: (row.geometry as number[][]) ?? [],
    };
  }

  async getOne(orgId: string, id: string) {
    const row = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `SELECT route_id, name, vehicle_id, distance_km, duration_min, geometry FROM saved_routes WHERE route_id = $1`,
        [id],
      );
      return r.rows[0];
    });
    if (!row) {
      throw new NotFoundException({ error_code: ERROR_CODES.NOT_FOUND, message: 'Saved route not found' });
    }
    return {
      route_id: row.route_id,
      name: row.name,
      vehicle_id: row.vehicle_id,
      distance_km: row.distance_km != null ? parseFloat(row.distance_km) : undefined,
      duration_min: row.duration_min != null ? parseFloat(row.duration_min) : undefined,
      geometry: (row.geometry as number[][]) ?? [],
    };
  }

  async delete(orgId: string, userId: string, id: string): Promise<void> {
    const deleted = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `DELETE FROM saved_routes WHERE route_id = $1 RETURNING route_id`,
        [id],
      );
      return r.rowCount ?? 0;
    });
    if (deleted === 0) {
      throw new NotFoundException({ error_code: ERROR_CODES.NOT_FOUND, message: 'Saved route not found' });
    }
    await this.audit.log(orgId, userId, 'delete', 'saved_route', id);
  }
}
