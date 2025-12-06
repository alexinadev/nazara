import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('staff')
export class StaffController {
  constructor(private svc: StaffService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.svc.create(body);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post(':id/working-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  addWorking(
    @Param('id') id: string,
    @Body() body: { dayOfWeek: number; startTime: string; endTime: string },
  ) {
    return this.svc.addWorkingHours(
      id,
      body.dayOfWeek,
      body.startTime,
      body.endTime,
    );
  }

  @Post(':id/day-off')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  addDayOff(
    @Param('id') id: string,
    @Body() body: { date: string; reason?: string },
  ) {
    return this.svc.addDayOff(id, new Date(body.date), body.reason);
  }
}
