import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clinicId: string, search?: string) {
    return this.prisma.patient.findMany({
      where: {
        clinicId,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, clinicId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, clinicId },
    });
    if (!patient) throw new NotFoundException('Hasta bulunamadı');
    return patient;
  }

  async findOneWithDetails(id: string, clinicId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, clinicId },
      include: {
        appointments: {
          include: { doctor: { select: { firstName: true, lastName: true } } },
          orderBy: { startTime: 'desc' },
        },
        treatments: {
          include: { steps: { orderBy: { order: 'asc' } } },
          orderBy: { createdAt: 'desc' },
        },
        payments: { orderBy: { createdAt: 'desc' } },
        files: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!patient) throw new NotFoundException('Hasta bulunamadı');
    return patient;
  }

  async create(dto: CreatePatientDto, clinicId: string) {
    return this.prisma.patient.create({
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        clinicId,
      },
    });
  }

  async update(id: string, dto: UpdatePatientDto, clinicId: string) {
    await this.findOne(id, clinicId);
    return this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
      },
    });
  }

  async remove(id: string, clinicId: string) {
    await this.findOne(id, clinicId);
    return this.prisma.patient.delete({ where: { id } });
  }
}
