import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthClaims, Role } from '@ezroot/shared';

export interface RequestUser extends AuthClaims {
  userId: string;
  orgId: string;
  role: Role;
  email?: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    if (!user) throw new Error('CurrentUser used without JWT auth');
    return user;
  },
);
