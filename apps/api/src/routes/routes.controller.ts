import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/current-user.decorator';
import { RouteRequestDto } from './dto/route-request.dto';

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RoutesController {
  constructor(private service: RoutesService) {}

  @Post('compute')
  async compute(@CurrentUser() user: RequestUser, @Body() dto: RouteRequestDto) {
    return this.service.compute(user.orgId, dto);
  }
}
