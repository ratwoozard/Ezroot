import { IsUUID, IsIn } from 'class-validator';

export class ExportRequestDto {
  @IsUUID()
  routeId: string;

  @IsIn(['GPX', 'PDF'])
  format: 'GPX' | 'PDF';
}
