import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { GraphhopperService } from './graphhopper.service';

@Module({
  controllers: [RoutesController],
  providers: [RoutesService, GraphhopperService],
})
export class RoutesModule {}
