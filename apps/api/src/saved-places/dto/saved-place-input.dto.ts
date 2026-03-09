import { IsString, IsNumber, IsOptional } from 'class-validator';

export class SavedPlaceInputDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;
}
