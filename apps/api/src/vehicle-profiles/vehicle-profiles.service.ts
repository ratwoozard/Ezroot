import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from './../db/db.service';
import { AuditService } from '../audit/audit.service';
import { VehicleProfileInputDto } from './dto/vehicle-profile-input.dto';
import { ERROR_CODES } from '@ezroot/shared';

@Injectable()
export class VehicleProfilesService {
  constructor(
    private db: DbService,
    private audit: AuditService,
  ) {}

  async list(orgId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [rows, countRes] = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `SELECT vehicle_id, org_id, name, length, width, height, weight, axles, hazardous_material
         FROM vehicle_profiles ORDER BY name LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      const c = await client.query(
        `SELECT COUNT(*)::int AS total FROM vehicle_profiles`,
      );
      return [r.rows, c.rows[0].total] as const;
    });
    return {
      items: rows.map((row: Record<string, unknown>) => ({
        vehicle_id: row.vehicle_id as string,
        org_id: row.org_id as string,
        name: row.name as string,
        length: parseFloat(String(row.length)),
        width: parseFloat(String(row.width)),
        height: parseFloat(String(row.height)),
        weight: parseFloat(String(row.weight)),
        axles: row.axles as number,
        hazardous_material: (row.hazardous_material as boolean) ?? false,
      })),
      totalCount: countRes,
    };
  }

  async create(orgId: string, userId: string, dto: VehicleProfileInputDto) {
    const row = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `INSERT INTO vehicle_profiles (org_id, name, length, width, height, weight, axles, hazardous_material)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING vehicle_id, org_id, name, length, width, height, weight, axles, hazardous_material`,
        [
          orgId,
          dto.name,
          dto.length,
          dto.width,
          dto.height,
          dto.weight,
          dto.axles,
          dto.hazardous_material ?? false,
        ],
      );
      return r.rows[0];
    });
    await this.audit.log(orgId, userId, 'create', 'vehicle_profile', row.vehicle_id, { name: dto.name });
    return {
      vehicle_id: row.vehicle_id,
      org_id: row.org_id,
      name: row.name,
      length: parseFloat(row.length),
      width: parseFloat(row.width),
      height: parseFloat(row.height),
      weight: parseFloat(row.weight),
      axles: row.axles,
      hazardous_material: row.hazardous_material ?? false,
    };
  }

  async getOne(orgId: string, id: string) {
    const row = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `SELECT vehicle_id, org_id, name, length, width, height, weight, axles, hazardous_material
         FROM vehicle_profiles WHERE vehicle_id = $1`,
        [id],
      );
      return r.rows[0];
    });
    if (!row) {
      throw new NotFoundException({ error_code: ERROR_CODES.NOT_FOUND, message: 'Vehicle profile not found' });
    }
    return {
      vehicle_id: row.vehicle_id,
      org_id: row.org_id,
      name: row.name,
      length: parseFloat(row.length),
      width: parseFloat(row.width),
      height: parseFloat(row.height),
      weight: parseFloat(row.weight),
      axles: row.axles,
      hazardous_material: row.hazardous_material ?? false,
    };
  }

  async update(orgId: string, userId: string, id: string, dto: VehicleProfileInputDto) {
    const row = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `UPDATE vehicle_profiles SET name=$2, length=$3, width=$4, height=$5, weight=$6, axles=$7, hazardous_material=$8
         WHERE vehicle_id = $1
         RETURNING vehicle_id, org_id, name, length, width, height, weight, axles, hazardous_material`,
        [id, dto.name, dto.length, dto.width, dto.height, dto.weight, dto.axles, dto.hazardous_material ?? false],
      );
      return r.rows[0];
    });
    if (!row) {
      throw new NotFoundException({ error_code: ERROR_CODES.NOT_FOUND, message: 'Vehicle profile not found' });
    }
    await this.audit.log(orgId, userId, 'update', 'vehicle_profile', id, { name: dto.name });
    return {
      vehicle_id: row.vehicle_id,
      org_id: row.org_id,
      name: row.name,
      length: parseFloat(row.length),
      width: parseFloat(row.width),
      height: parseFloat(row.height),
      weight: parseFloat(row.weight),
      axles: row.axles,
      hazardous_material: row.hazardous_material ?? false,
    };
  }

  async delete(orgId: string, userId: string, id: string): Promise<void> {
    const deleted = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `DELETE FROM vehicle_profiles WHERE vehicle_id = $1 RETURNING vehicle_id`,
        [id],
      );
      return r.rowCount ?? 0;
    });
    if (deleted === 0) {
      throw new NotFoundException({ error_code: ERROR_CODES.NOT_FOUND, message: 'Vehicle profile not found' });
    }
    await this.audit.log(orgId, userId, 'delete', 'vehicle_profile', id);
  }
}
