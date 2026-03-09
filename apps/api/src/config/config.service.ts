import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get databaseUrl(): string {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    return url;
  }

  get jwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16)
      throw new Error('JWT_SECRET must be set and at least 16 characters');
    return secret;
  }

  get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '7d';
  }

  get port(): number {
    return parseInt(process.env.API_PORT || process.env.PORT || '3001', 10);
  }

  get graphhopperUrl(): string | null {
    const url = process.env.GRAPHHOPPER_URL;
    return url && url.length > 0 ? url.replace(/\/$/, '') : null;
  }
}
