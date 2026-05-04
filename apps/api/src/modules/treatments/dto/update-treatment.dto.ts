import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { TreatmentStatus } from '@prisma/client';

export class UpdateTreatmentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TreatmentStatus, { message: 'Geçersiz durum' })
  @IsOptional()
  status?: TreatmentStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalCost?: number;
}
