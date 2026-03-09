import { IsString, IsNumber, IsInt, IsBoolean, Min, IsOptional } from 'class-validator';

export class VehicleProfileInputDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  length: number;

  @IsNumber()
  @Min(0)
  width: number;

  @IsNumber()
  @Min(0)
  height: number;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsInt()
  @Min(1)
  axles: number;

  @IsOptional()
  @IsBoolean()
  hazardous_material?: boolean;
}
