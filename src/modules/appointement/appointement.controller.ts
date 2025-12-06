import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Get,
} from '@nestjs/common';
import { AppointmentService } from './appointement.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateAppointmentDto } from './dto/create-appointement.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private svc: AppointmentService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateAppointmentDto) {
    return this.svc.createAppointment(user.id, dto);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.cancelAppointment(user.id, id);
  }

  @Patch(':id/done')
  markDone(@Param('id') id: string) {
    return this.svc.markDone(id);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc['prisma'].appointment.findUnique({ where: { id } });
  }
}
