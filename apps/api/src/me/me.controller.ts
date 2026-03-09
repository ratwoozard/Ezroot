import { Controller, Get, UseGuards } from '@nestjs/common';
import { MeService } from './me.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/current-user.decorator';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private me: MeService) {}

  @Get()
  async getMe(@CurrentUser() user: RequestUser) {
    return this.me.getMe(user.orgId, user.userId);
  }
}
