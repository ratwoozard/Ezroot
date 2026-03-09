import { Controller, Get, Post, Delete, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SavedRoutesService } from './saved-routes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/current-user.decorator';
import { SavedRouteInputDto } from './dto/saved-route-input.dto';
import { parsePagination } from '@ezroot/shared';

@Controller('saved-routes')
@UseGuards(JwtAuthGuard)
export class SavedRoutesController {
  constructor(private service: SavedRoutesService) {}

  @Get()
  async list(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const { page: p, limit: l } = parsePagination({ page, limit });
    const result = await this.service.list(user.orgId, p, l, search);
    if (res) res.setHeader('X-Total-Count', String(result.totalCount));
    return result;
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() dto: SavedRouteInputDto) {
    return this.service.create(user.orgId, user.userId, dto);
  }

  @Get(':id')
  async getOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getOne(user.orgId, id);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.service.delete(user.orgId, user.userId, id);
  }
}
