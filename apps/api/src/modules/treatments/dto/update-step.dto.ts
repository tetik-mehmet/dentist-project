import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { StepStatus } from '@prisma/client';

export class UpdateStepDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(StepStatus, { message: 'Geçersiz adım durumu' })
  @IsOptional()
  status?: StepStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;
}
