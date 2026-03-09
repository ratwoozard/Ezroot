import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ERROR_CODES } from '@ezroot/shared';

@Injectable()
export class MeService {
  constructor(private db: DbService) {}

  async getMe(orgId: string, userId: string) {
    const row = await this.db.runInTenant(orgId, async (client) => {
      const q = await client.query(
        `SELECT user_id, org_id, email, name, role FROM users WHERE user_id = $1`,
        [userId],
      );
      return q.rows[0];
    });
    if (!row) {
      throw new NotFoundException({
        error_code: ERROR_CODES.NOT_FOUND,
        message: 'User not found',
      });
    }
    return {
      user_id: row.user_id,
      org_id: row.org_id,
      email: row.email,
      name: row.name,
      role: row.role,
    };
  }
}
