import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { AuditService } from '../audit/audit.service';
import { ERROR_CODES } from '@ezroot/shared';
import { SavedPlaceInputDto } from './dto/saved-place-input.dto';

@Injectable()
export class SavedPlacesService {
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
          ? `SELECT place_id, name, address, lat, lon FROM saved_places WHERE (name ILIKE $3 OR address ILIKE $3) ORDER BY name LIMIT $1 OFFSET $2`
          : `SELECT place_id, name, address, lat, lon FROM saved_places ORDER BY name LIMIT $1 OFFSET $2`,
        listParams,
      );
      const c = await client.query(
        hasSearch
          ? `SELECT COUNT(*)::int AS total FROM saved_places WHERE name ILIKE $1 OR address ILIKE $1`
          : `SELECT COUNT(*)::int AS total FROM saved_places`,
        hasSearch ? [`%${searchTerm}%`] : [],
      );
      return [r.rows, c.rows[0].total] as const;
    });
    return {
      items: rows.map((row: Record<string, unknown>) => ({
        place_id: row.place_id as string,
        name: row.name as string,
        address: (row.address as string | null) ?? undefined,
        lat: parseFloat(String(row.lat)),
        lon: parseFloat(String(row.lon)),
      })),
      totalCount: countRes,
    };
  }

  async create(orgId: string, userId: string, dto: SavedPlaceInputDto) {
    const row = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `INSERT INTO saved_places (org_id, name, address, lat, lon)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING place_id, name, address, lat, lon`,
        [orgId, dto.name, dto.address ?? null, dto.lat, dto.lon],
      );
      return r.rows[0];
    });
    await this.audit.log(orgId, userId, 'create', 'saved_place', row.place_id, { name: dto.name });
    return {
      place_id: row.place_id,
      name: row.name,
      address: row.address ?? undefined,
      lat: parseFloat(row.lat),
      lon: parseFloat(row.lon),
    };
  }

  async delete(orgId: string, userId: string, id: string): Promise<void> {
    const deleted = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `DELETE FROM saved_places WHERE place_id = $1 RETURNING place_id`,
        [id],
      );
      return r.rowCount ?? 0;
    });
    if (deleted === 0) {
      throw new NotFoundException({ error_code: ERROR_CODES.NOT_FOUND, message: 'Saved place not found' });
    }
    await this.audit.log(orgId, userId, 'delete', 'saved_place', id);
  }
}
