import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AddPaymentDto } from './dto/add-payment.dto';

const PAYMENT_INCLUDE = {
  patient: { select: { id: true, firstName: true, lastName: true } },
  treatment: { select: { id: true, title: true } },
};

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clinicId: string, patientId?: string) {
    return this.prisma.payment.findMany({
      where: { clinicId, ...(patientId && { patientId }) },
      include: PAYMENT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, clinicId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, clinicId },
      include: PAYMENT_INCLUDE,
    });
    if (!payment) throw new NotFoundException('Ödeme kaydı bulunamadı');
    return payment;
  }

  async create(dto: CreatePaymentDto, clinicId: string) {
    const paidAmount = dto.paidAmount ?? 0;

    if (paidAmount > dto.totalAmount) {
      throw new BadRequestException(
        'Ödenen tutar toplam tutarı geçemez',
      );
    }

    const status =
      paidAmount === 0
        ? 'pending'
        : paidAmount >= dto.totalAmount
        ? 'paid'
        : 'partial';

    return this.prisma.payment.create({
      data: {
        totalAmount: dto.totalAmount,
        paidAmount,
        amount: paidAmount,
        status,
        patientId: dto.patientId,
        treatmentId: dto.treatmentId,
        notes: dto.notes,
        clinicId,
        paidAt: paidAmount > 0 ? new Date() : null,
      },
      include: PAYMENT_INCLUDE,
    });
  }

  // Mevcut ödemeye ek ödeme kaydet
  async addPayment(id: string, dto: AddPaymentDto, clinicId: string) {
    const payment = await this.findOne(id, clinicId);

    const newPaid = Number(payment.paidAmount) + dto.amount;

    if (newPaid > Number(payment.totalAmount)) {
      throw new BadRequestException(
        `En fazla ${Number(payment.totalAmount) - Number(payment.paidAmount)} ₺ ödeme eklenebilir`,
      );
    }

    const status =
      newPaid >= Number(payment.totalAmount) ? 'paid' : 'partial';

    return this.prisma.payment.update({
      where: { id },
      data: {
        paidAmount: newPaid,
        amount: newPaid,
        status,
        paidAt: new Date(),
        notes: dto.notes ? `${payment.notes ?? ''}\n${dto.notes}`.trim() : payment.notes,
      },
      include: PAYMENT_INCLUDE,
    });
  }

  async remove(id: string, clinicId: string) {
    await this.findOne(id, clinicId);
    return this.prisma.payment.delete({ where: { id } });
  }

  // Özet: klinik geneli bekleyen ödemeler
  async getSummary(clinicId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { clinicId },
      select: { totalAmount: true, paidAmount: true, status: true },
    });

    const total = payments.reduce((s, p) => s + Number(p.totalAmount), 0);
    const paid = payments.reduce((s, p) => s + Number(p.paidAmount), 0);
    const pending = total - paid;

    return {
      total,
      paid,
      pending,
      count: payments.length,
      pendingCount: payments.filter((p) => p.status !== 'paid').length,
    };
  }
}
