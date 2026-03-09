import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@ezroot/shared';
import { ConfigService } from '../config/config.service';
import { RequestUser } from '../common/current-user.decorator';

interface JwtPayload {
  sub: string;
  org: string;
  role: string;
  email?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  validate(payload: JwtPayload): RequestUser {
    if (!payload.sub || !payload.org) {
      throw new UnauthorizedException({
        error_code: 'UNAUTHORIZED',
        message: 'Invalid token',
      });
    }
    return {
      sub: payload.sub,
      org: payload.org,
      role: payload.role as Role,
      email: payload.email,
      userId: payload.sub,
      orgId: payload.org,
    };
  }
}
