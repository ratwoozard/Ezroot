import { Module } from '@nestjs/common';
import { SavedRoutesController } from './saved-routes.controller';
import { SavedRoutesService } from './saved-routes.service';

@Module({
  controllers: [SavedRoutesController],
  providers: [SavedRoutesService],
})
export class SavedRoutesModule {}
