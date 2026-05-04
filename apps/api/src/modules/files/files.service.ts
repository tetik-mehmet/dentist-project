import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FilesService {
  private readonly uploadDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async findAll(clinicId: string, patientId?: string) {
    return this.prisma.file.findMany({
      where: { clinicId, ...(patientId && { patientId }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, clinicId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id, clinicId },
    });
    if (!file) throw new NotFoundException('Dosya bulunamadı');
    return file;
  }

  async upload(
    file: Express.Multer.File,
    patientId: string,
    clinicId: string,
    description?: string,
  ) {
    const key = `${randomUUID()}${path.extname(file.originalname)}`;
    const dest = path.join(this.uploadDir, key);

    fs.writeFileSync(dest, file.buffer);

    const apiUrl = this.config.get<string>('API_URL') || 'http://localhost:3001';
    const url = `${apiUrl}/api/files/static/${key}`;

    return this.prisma.file.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        key,
        url,
        description,
        patientId,
        clinicId,
      },
    });
  }

  async remove(id: string, clinicId: string) {
    const file = await this.findOne(id, clinicId);

    const filePath = path.join(this.uploadDir, file.key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return this.prisma.file.delete({ where: { id } });
  }

  getFilePath(key: string): string {
    return path.join(this.uploadDir, key);
  }
}
