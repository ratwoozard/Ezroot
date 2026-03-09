import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/current-user.decorator';
import { ExportRequestDto } from './dto/export-request.dto';

@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private service: ExportsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async create(@CurrentUser() user: RequestUser, @Body() dto: ExportRequestDto) {
    return this.service.createJob(user.orgId, user.userId, dto);
  }

  @Get(':jobId')
  async getJob(@CurrentUser() user: RequestUser, @Param('jobId') jobId: string) {
    return this.service.getJob(user.orgId, jobId);
  }
}
