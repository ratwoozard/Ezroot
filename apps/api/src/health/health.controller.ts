import { Controller, Get } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Controller('health')
export class HealthController {
  constructor(private db: DbService) {}

  @Get()
  async check() {
    const dbOk = await this.db.healthCheck().catch(() => false);
    const status = dbOk ? 'ok' : 'degraded';
    return {
      status,
      database: dbOk ? 'up' : 'down',
    };
  }
}
