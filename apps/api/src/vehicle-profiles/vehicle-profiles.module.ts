import { Module } from '@nestjs/common';
import { VehicleProfilesController } from './vehicle-profiles.controller';
import { VehicleProfilesService } from './vehicle-profiles.service';

@Module({
  controllers: [VehicleProfilesController],
  providers: [VehicleProfilesService],
})
export class VehicleProfilesModule {}
