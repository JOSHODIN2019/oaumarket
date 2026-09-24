import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { REPORT_TARGET_TYPES } from '../schemas/report.schema.js';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  reporterId: string;

  @IsIn(REPORT_TARGET_TYPES)
  targetType: (typeof REPORT_TARGET_TYPES)[number];

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;
}
