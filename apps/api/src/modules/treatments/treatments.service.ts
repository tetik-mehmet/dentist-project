import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { UpdateStepDto } from './dto/update-step.dto';

const TREATMENT_INCLUDE = {
  patient: { select: { id: true, firstName: true, lastName: true } },
  steps: { orderBy: { order: 'asc' as const } },
};

@Injectable()
export class TreatmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clinicId: string, patientId?: string) {
    return this.prisma.treatment.findMany({
      where: { clinicId, ...(patientId && { patientId }) },
      include: TREATMENT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, clinicId: string) {
    const treatment = await this.prisma.treatment.findFirst({
      where: { id, clinicId },
      include: TREATMENT_INCLUDE,
    });
    if (!treatment) throw new NotFoundException('Tedavi bulunamadı');
    return treatment;
  }

  async create(dto: CreateTreatmentDto, clinicId: string) {
    const { steps, ...rest } = dto;
    return this.prisma.treatment.create({
      data: {
        ...rest,
        totalCost: rest.totalCost ?? 0,
        clinicId,
        ...(steps && steps.length > 0
          ? {
              steps: {
                create: steps.map((s) => ({
                  title: s.title,
                  description: s.description,
                  order: s.order,
                  cost: s.cost ?? 0,
                })),
              },
            }
          : {}),
      },
      include: TREATMENT_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateTreatmentDto, clinicId: string) {
    await this.findOne(id, clinicId);
    return this.prisma.treatment.update({
      where: { id },
      data: { ...dto },
      include: TREATMENT_INCLUDE,
    });
  }

  async remove(id: string, clinicId: string) {
    await this.findOne(id, clinicId);
    return this.prisma.treatment.delete({ where: { id } });
  }

  // ─── Adım yönetimi ─────────────────────────────────────────────────────────

  async updateStep(stepId: string, dto: UpdateStepDto, clinicId: string) {
    const step = await this.prisma.treatmentStep.findFirst({
      where: { id: stepId, treatment: { clinicId } },
    });
    if (!step) throw new NotFoundException('Adım bulunamadı');

    const updated = await this.prisma.treatmentStep.update({
      where: { id: stepId },
      data: { ...dto },
      include: {
        treatment: {
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    // Tüm adımlar tamamlandıysa tedaviyi otomatik tamamla
    const allSteps = await this.prisma.treatmentStep.findMany({
      where: { treatmentId: step.treatmentId },
    });

    const allDone = allSteps.every((s) =>
      s.id === stepId ? dto.status === 'completed' : s.status === 'completed',
    );

    if (allDone) {
      await this.prisma.treatment.update({
        where: { id: step.treatmentId },
        data: { status: 'completed' },
      });
    } else if (dto.status === 'completed' || dto.status === 'skipped') {
      await this.prisma.treatment.update({
        where: { id: step.treatmentId },
        data: { status: 'in_progress' },
      });
    }

    return updated;
  }

  async addStep(
    treatmentId: string,
    dto: { title: string; description?: string; order: number; cost?: number },
    clinicId: string,
  ) {
    await this.findOne(treatmentId, clinicId);
    return this.prisma.treatmentStep.create({
      data: {
        treatmentId,
        title: dto.title,
        description: dto.description,
        order: dto.order,
        cost: dto.cost ?? 0,
      },
    });
  }

  async removeStep(stepId: string, clinicId: string) {
    const step = await this.prisma.treatmentStep.findFirst({
      where: { id: stepId, treatment: { clinicId } },
    });
    if (!step) throw new NotFoundException('Adım bulunamadı');
    return this.prisma.treatmentStep.delete({ where: { id: stepId } });
  }
}
