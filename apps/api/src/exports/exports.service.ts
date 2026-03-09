import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { AuditService } from '../audit/audit.service';
import { ERROR_CODES } from '@ezroot/shared';
import { ExportRequestDto } from './dto/export-request.dto';

@Injectable()
export class ExportsService {
  constructor(
    private db: DbService,
    private audit: AuditService,
  ) {}

  async createJob(orgId: string, userId: string, dto: ExportRequestDto) {
    const route = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `SELECT route_id, name, geometry, distance_km, duration_min FROM saved_routes WHERE route_id = $1`,
        [dto.routeId],
      );
      return r.rows[0];
    });
    if (!route) {
      throw new NotFoundException({ error_code: ERROR_CODES.NOT_FOUND, message: 'Saved route not found' });
    }

    const job = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `INSERT INTO export_jobs (org_id, route_id, format, status) VALUES ($1, $2, $3, 'pending')
         RETURNING job_id, status, file_url, message`,
        [orgId, dto.routeId, dto.format],
      );
      return r.rows[0];
    });

    await this.audit.log(orgId, userId, 'create', 'export_job', job.job_id, { routeId: dto.routeId, format: dto.format });

    try {
      if (dto.format === 'GPX') {
        const gpx = this.buildGpx(route.name, (route.geometry as number[][]) ?? []);
        const fileUrl = 'data:application/gpx+xml;base64,' + Buffer.from(gpx, 'utf8').toString('base64');
        await this.db.runInTenant(orgId, async (client) => {
          await client.query(
            `UPDATE export_jobs SET status = 'completed', file_url = $2 WHERE job_id = $1`,
            [job.job_id, fileUrl],
          );
        });
        return {
          job_id: job.job_id,
          status: 'completed' as const,
          file_url: fileUrl,
          message: null,
        };
      }
      if (dto.format === 'PDF') {
        await this.db.runInTenant(orgId, async (client) => {
          await client.query(
            `UPDATE export_jobs SET status = 'completed', file_url = $2, message = $3 WHERE job_id = $1`,
            [job.job_id, '/exports/placeholder.pdf', 'PDF-eksport er placeholder. Brug GPX til nu.'],
          );
        });
        return {
          job_id: job.job_id,
          status: 'completed' as const,
          file_url: '/exports/placeholder.pdf',
          message: 'PDF-eksport er placeholder. Brug GPX til nu.',
        };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      await this.db.runInTenant(orgId, async (client) => {
        await client.query(
          `UPDATE export_jobs SET status = 'failed', message = $2 WHERE job_id = $1`,
          [job.job_id, msg],
        );
      });
      return {
        job_id: job.job_id,
        status: 'failed' as const,
        file_url: null,
        message: msg,
      };
    }

    return {
      job_id: job.job_id,
      status: job.status,
      file_url: job.file_url ?? null,
      message: job.message ?? null,
    };
  }

  async getJob(orgId: string, jobId: string) {
    const row = await this.db.runInTenant(orgId, async (client) => {
      const r = await client.query(
        `SELECT job_id, status, file_url, message FROM export_jobs WHERE job_id = $1`,
        [jobId],
      );
      return r.rows[0];
    });
    if (!row) {
      throw new NotFoundException({ error_code: ERROR_CODES.NOT_FOUND, message: 'Export job not found' });
    }
    return {
      job_id: row.job_id,
      status: row.status,
      file_url: row.file_url ?? null,
      message: row.message ?? null,
    };
  }

  private buildGpx(name: string, geometry: number[][]): string {
    const points = geometry.map(([lon, lat]) => `    <trkpt lat="${lat}" lon="${lon}"></trkpt>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="EzRoot">
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>`;
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
