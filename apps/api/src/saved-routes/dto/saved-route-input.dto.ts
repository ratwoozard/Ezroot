import { IsString, IsUUID, IsNumber, IsArray, IsOptional } from 'class-validator';

export class SavedRouteInputDto {
  @IsString()
  name: string;

  @IsUUID()
  vehicleId: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  waypoints?: string[];

  @IsOptional()
  @IsArray()
  geometry?: number[][];

  @IsOptional()
  @IsNumber()
  distance_km?: number;

  @IsOptional()
  @IsNumber()
  duration_min?: number;
}
