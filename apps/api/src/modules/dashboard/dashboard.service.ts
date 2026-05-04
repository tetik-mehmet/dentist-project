import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(clinicId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [
      totalPatients,
      todayAppointments,
      activeTreatments,
      paymentSummary,
      recentPatients,
      upcomingAppointments,
      recentAuditLogs,
    ] = await Promise.all([
      // Toplam hasta
      this.prisma.patient.count({ where: { clinicId } }),

      // Bugünkü randevular
      this.prisma.appointment.count({
        where: {
          clinicId,
          startTime: { gte: today, lt: tomorrow },
          status: { notIn: ['cancelled'] },
        },
      }),

      // Aktif tedaviler
      this.prisma.treatment.count({
        where: { clinicId, status: { in: ['planned', 'in_progress'] } },
      }),

      // Ödeme özeti
      this.prisma.payment.aggregate({
        where: { clinicId },
        _sum: { totalAmount: true, paidAmount: true },
      }),

      // Son eklenen 5 hasta
      this.prisma.patient.findMany({
        where: { clinicId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
        },
      }),

      // Yaklaşan 5 randevu (bugün + sonrası)
      this.prisma.appointment.findMany({
        where: {
          clinicId,
          startTime: { gte: today },
          status: 'scheduled',
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          doctor: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { startTime: 'asc' },
        take: 5,
      }),

      // Son 10 audit kaydı
      this.prisma.auditLog.findMany({
        where: { clinicId },
        include: {
          user: { select: { firstName: true, lastName: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalAmount = Number(paymentSummary._sum.totalAmount ?? 0);
    const paidAmount = Number(paymentSummary._sum.paidAmount ?? 0);

    return {
      stats: {
        totalPatients,
        todayAppointments,
        activeTreatments,
        pendingPayments: totalAmount - paidAmount,
      },
      recentPatients,
      upcomingAppointments,
      recentAuditLogs,
    };
  }
}
