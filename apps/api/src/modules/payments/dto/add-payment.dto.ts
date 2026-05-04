import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
