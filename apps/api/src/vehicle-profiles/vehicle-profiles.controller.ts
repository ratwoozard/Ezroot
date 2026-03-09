import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { VehicleProfilesService } from './vehicle-profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/current-user.decorator';
import { VehicleProfileInputDto } from './dto/vehicle-profile-input.dto';
import { parsePagination } from '@ezroot/shared';

@Controller('vehicle-profiles')
@UseGuards(JwtAuthGuard)
export class VehicleProfilesController {
  constructor(private service: VehicleProfilesService) {}

  @Get()
  async list(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const { page: p, limit: l } = parsePagination({ page, limit });
    const result = await this.service.list(user.orgId, p, l);
    if (res) res.setHeader('X-Total-Count', String(result.totalCount));
    return result;
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() dto: VehicleProfileInputDto) {
    return this.service.create(user.orgId, user.userId, dto);
  }

  @Get(':id')
  async getOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getOne(user.orgId, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: VehicleProfileInputDto,
  ) {
    return this.service.update(user.orgId, user.userId, id, dto);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.service.delete(user.orgId, user.userId, id);
  }
}
