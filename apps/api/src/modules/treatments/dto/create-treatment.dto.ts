import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTreatmentStepDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  order: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;
}

export class CreateTreatmentDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  patientId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalCost?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTreatmentStepDto)
  @IsOptional()
  steps?: CreateTreatmentStepDto[];
}
