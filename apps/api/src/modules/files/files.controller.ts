import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as fs from 'fs';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // Statik dosya serve (auth gerekmez)
  @Get('static/:key')
  serveFile(@Param('key') key: string, @Res() res: Response) {
    const filePath = this.filesService.getFilePath(key);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Dosya bulunamadı');
    }
    return res.sendFile(filePath);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @CurrentUser() user: any,
    @Query('patientId') patientId?: string,
  ) {
    return this.filesService.findAll(user.clinicId, patientId);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Yalnızca JPEG, PNG, WEBP ve PDF dosyaları kabul edilir'), false);
        }
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('patientId') patientId: string,
    @Body('description') description: string,
    @CurrentUser() user: any,
  ) {
    return this.filesService.upload(file, patientId, user.clinicId, description);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.filesService.remove(id, user.clinicId);
  }
}
