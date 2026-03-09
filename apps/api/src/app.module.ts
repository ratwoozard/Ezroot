import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { VehicleProfilesModule } from './vehicle-profiles/vehicle-profiles.module';
import { SavedPlacesModule } from './saved-places/saved-places.module';
import { RoutesModule } from './routes/routes.module';
import { SavedRoutesModule } from './saved-routes/saved-routes.module';
import { ExportsModule } from './exports/exports.module';

// Repo-root .env (fra apps/api/dist: ../../../ = root)
const rootEnv = path.resolve(__dirname, '../../../.env');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [rootEnv, '.env', '../.env'] }),
    AppConfigModule,
    DbModule,
    AuditModule,
    HealthModule,
    AuthModule,
    MeModule,
    VehicleProfilesModule,
    SavedPlacesModule,
    RoutesModule,
    SavedRoutesModule,
    ExportsModule,
  ],
})
export class AppModule {}
