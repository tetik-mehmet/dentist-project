import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userId: string;
  clinicId: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry) {
    return this.prisma.auditLog.create({
      data: {
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        oldData: entry.oldData,
        newData: entry.newData,
        ipAddress: entry.ipAddress,
        userId: entry.userId,
        clinicId: entry.clinicId,
      },
    });
  }

  async findAll(
    clinicId: string,
    query: {
      entityType?: string;
      userId?: string;
      limit?: number;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    // 'YYYY-MM-DD' formatındaki string'i YEREL gece yarısı/sonu olarak parse et.
    // new Date('YYYY-MM-DD') UTC midnight döndürür; +3 kaymasını engellemek için
    // new Date(y, m, d, ...) kullanıyoruz — bu her zaman LOCAL saattir.
    const createdAtFilter: Record<string, Date> = {};
    if (query.dateFrom) {
      const [y, mo, d] = query.dateFrom.split('-').map(Number);
      createdAtFilter.gte = new Date(y, mo - 1, d, 0, 0, 0, 0);
    }
    if (query.dateTo) {
      const [y, mo, d] = query.dateTo.split('-').map(Number);
      createdAtFilter.lte = new Date(y, mo - 1, d, 23, 59, 59, 999);
    }

    return this.prisma.auditLog.findMany({
      where: {
        clinicId,
        ...(query.entityType && { entityType: query.entityType }),
        ...(query.userId && { userId: query.userId }),
        ...(Object.keys(createdAtFilter).length > 0 && { createdAt: createdAtFilter }),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 50,
    });
  }
}
