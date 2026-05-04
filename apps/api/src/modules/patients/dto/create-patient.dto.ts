import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  MinLength,
} from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsString()
  @MinLength(10)
  phone: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta girin' })
  @IsOptional()
  email?: string;

  @IsDateString({}, { message: 'Geçerli bir tarih girin (YYYY-MM-DD)' })
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
