import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsDateString({}, { message: 'Geçerli bir başlangıç tarihi girin' })
  startTime: string;

  @IsDateString({}, { message: 'Geçerli bir bitiş tarihi girin' })
  endTime: string;

  @IsString()
  patientId: string;

  @IsString()
  doctorId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
