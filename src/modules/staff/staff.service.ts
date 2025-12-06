import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
// import { isBefore, addMinutes } from 'date-fns';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.staff.create({ data });
  }

  async findAll(salonId?: string) {
    return this.prisma.staff.findMany({ where: { salonId }});
  }

  async findOne(id: string) {
    return this.prisma.staff.findUnique({ where: { id }});
  }

  async update(id: string, dto: any) {
    return this.prisma.staff.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.staff.delete({ where: { id }});
  }

  async addWorkingHours(staffId: string, dayOfWeek: number, startTime: string, endTime: string) {
    // basic validation
    const existsOverlap = await this.prisma.staffWorkingHours.findFirst({
      where: { staffId, dayOfWeek, AND: [{ startTime: { lte: endTime } }, { endTime: { gte: startTime } }] },
    });
    if (existsOverlap) throw new BadRequestException('Overlapping working hours');
    return this.prisma.staffWorkingHours.create({ data: { staffId, dayOfWeek, startTime, endTime }});
  }

  async addDayOff(staffId: string, date: Date, reason?: string) {
    return this.prisma.staffDayOff.create({ data: { staffId, date, reason }});
  }
}
