import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DbService } from '../db/db.service';
import { ROLES } from '@ezroot/shared';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 10;

export interface UserRow {
  user_id: string;
  org_id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private db: DbService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<UserRow> {
    const client = await this.db.getClient();
    try {
      const r = await client.query(`SELECT 1 FROM get_user_by_email($1)`, [dto.email]);
      if (r.rowCount && r.rowCount > 0) {
        throw new ConflictException({
          error_code: 'INVALID_INPUT',
          message: 'Email already registered',
        });
      }
    } finally {
      client.release();
    }

    return this.db.runInTransaction(async (client) => {
      const orgRes = await client.query(
        `INSERT INTO organizations (name) VALUES ($1) RETURNING id`,
        [dto.orgName],
      );
      const orgId = orgRes.rows[0].id as string;
      await client.query(`SET LOCAL app.current_org_id = $1`, [orgId]);
      const hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
      const userRes = await client.query(
        `INSERT INTO users (org_id, email, password_hash, name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING user_id, org_id, email, name, role`,
        [orgId, dto.email, hash, dto.name, ROLES.admin],
      );
      const row = userRes.rows[0];
      return {
        user_id: row.user_id,
        org_id: row.org_id,
        email: row.email,
        name: row.name,
        role: row.role,
      };
    });
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: UserRow }> {
    const client = await this.db.getClient();
    let userRow: UserRow | null = null;
    try {
      const res = await client.query(
        `SELECT * FROM get_user_by_email($1)`,
        [dto.email],
      );
      if (!res.rows.length) {
        throw new UnauthorizedException({
          error_code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }
      const row = res.rows[0];
      const ok = await bcrypt.compare(dto.password, row.password_hash);
      if (!ok) {
        throw new UnauthorizedException({
          error_code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }
      userRow = {
        user_id: row.user_id,
        org_id: row.org_id,
        email: row.email,
        name: row.name,
        role: row.role,
      };
    } finally {
      client.release();
    }

    const access_token = this.jwt.sign({
      sub: userRow!.user_id,
      org: userRow!.org_id,
      role: userRow!.role,
      email: userRow!.email,
    });
    return { access_token, user: userRow! };
  }
}
