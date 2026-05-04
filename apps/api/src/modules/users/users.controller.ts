import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.usersService.findByClinic(user.clinicId);
  }

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Sadece yöneticiler personel ekleyebilir');
    }
    return this.usersService.createStaff({ ...dto, clinicId: user.clinicId });
  }

  @Delete(':id')
  deactivate(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Sadece yöneticiler personel silebilir');
    }
    return this.usersService.deactivate(id, user.clinicId);
  }

  @Patch('me/password')
  changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: any) {
    return this.usersService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
