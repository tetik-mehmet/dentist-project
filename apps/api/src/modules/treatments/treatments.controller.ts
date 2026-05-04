import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('treatments')
@UseGuards(JwtAuthGuard)
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('patientId') patientId?: string,
  ) {
    return this.treatmentsService.findAll(user.clinicId, patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.treatmentsService.findOne(id, user.clinicId);
  }

  @Post()
  create(@Body() dto: CreateTreatmentDto, @CurrentUser() user: any) {
    return this.treatmentsService.create(dto, user.clinicId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTreatmentDto,
    @CurrentUser() user: any,
  ) {
    return this.treatmentsService.update(id, dto, user.clinicId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.treatmentsService.remove(id, user.clinicId);
  }

  // ─── Adımlar ───────────────────────────────────────────────────────────────

  @Post(':id/steps')
  addStep(
    @Param('id') treatmentId: string,
    @Body() dto: { title: string; description?: string; order: number; cost?: number },
    @CurrentUser() user: any,
  ) {
    return this.treatmentsService.addStep(treatmentId, dto, user.clinicId);
  }

  @Patch('steps/:stepId')
  updateStep(
    @Param('stepId') stepId: string,
    @Body() dto: UpdateStepDto,
    @CurrentUser() user: any,
  ) {
    return this.treatmentsService.updateStep(stepId, dto, user.clinicId);
  }

  @Delete('steps/:stepId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeStep(@Param('stepId') stepId: string, @CurrentUser() user: any) {
    return this.treatmentsService.removeStep(stepId, user.clinicId);
  }
}
