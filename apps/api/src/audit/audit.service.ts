import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private db: DbService) {}

  async log(
    orgId: string,
    userId: string | null,
    action: string,
    entityType: string,
    entityId: string | null,
    payload?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.db.runInTenant(orgId, async (client) => {
        await client.query(
          `INSERT INTO audit_log (org_id, action, entity_type, entity_id, user_id, payload)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orgId, action, entityType, entityId, userId, payload ? JSON.stringify(payload) : null],
        );
      });
    } catch (err) {
      this.logger.warn(`Audit log failed: ${action} ${entityType}/${entityId}`, err instanceof Error ? err.stack : String(err));
    }
  }
}
