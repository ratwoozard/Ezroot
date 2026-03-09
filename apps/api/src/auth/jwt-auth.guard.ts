import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ERROR_CODES } from '@ezroot/shared';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: Error | null, user: TUser) {
    if (err || !user) {
      throw new UnauthorizedException({
        error_code: ERROR_CODES.UNAUTHORIZED,
        message: 'Invalid or missing token',
      });
    }
    return user;
  }
}
