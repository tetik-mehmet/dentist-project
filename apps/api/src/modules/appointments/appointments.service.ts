import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    clinicId: string,
    query: { patientId?: string; doctorId?: string; from?: string; to?: string },
  ) {
    return this.prisma.appointment.findMany({
      where: {
        clinicId,
        ...(query.patientId && { patientId: query.patientId }),
        ...(query.doctorId && { doctorId: query.doctorId }),
        ...(query.from || query.to
          ? {
              startTime: {
                ...(query.from && { gte: new Date(query.from) }),
                ...(query.to && { lte: new Date(query.to) }),
              },
            }
          : {}),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string, clinicId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, clinicId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!appointment) throw new NotFoundException('Randevu bulunamadı');
    return appointment;
  }

  async create(dto: CreateAppointmentDto, clinicId: string) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (end <= start) {
      throw new BadRequestException('Bitiş zamanı başlangıçtan sonra olmalıdır');
    }

    // Çakışma kontrolü
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        clinicId,
        doctorId: dto.doctorId,
        status: { notIn: ['cancelled'] },
        OR: [
          { startTime: { lt: end }, endTime: { gt: start } },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException('Bu saatte doktorun başka bir randevusu var');
    }

    return this.prisma.appointment.create({
      data: {
        startTime: start,
        endTime: end,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        notes: dto.notes,
        clinicId,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, dto: UpdateAppointmentDto, clinicId: string) {
    await this.findOne(id, clinicId);

    const data: any = { ...dto };
    if (dto.startTime) data.startTime = new Date(dto.startTime);
    if (dto.endTime) data.endTime = new Date(dto.endTime);

    return this.prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: string, clinicId: string) {
    await this.findOne(id, clinicId);
    return this.prisma.appointment.delete({ where: { id } });
  }
}
