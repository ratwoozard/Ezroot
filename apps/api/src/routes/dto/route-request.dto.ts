import { IsString, IsUUID, IsArray, IsOptional } from 'class-validator';

export class RouteRequestDto {
  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  waypoints?: string[];

  @IsOptional()
  @IsUUID()
  vehicleId?: string;
}
