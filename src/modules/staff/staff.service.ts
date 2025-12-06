import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.staff.create({ data });
  }

  async findAll(salonId?: string) {
    return this.prisma.staff.findMany({
      where: salonId ? { salonId } : undefined,
    });
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async update(id: string, data: any) {
    return this.prisma.staff.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.staff.delete({ where: { id } });
  }

  async addWorkingHours(
    staffId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ) {
    // check overlap
    const conflict = await this.prisma.staffWorkingHours.findFirst({
      where: {
        staffId,
        dayOfWeek,
        AND: [{ startTime: { lte: endTime } }, { endTime: { gte: startTime } }],
      },
    });
    if (conflict) throw new BadRequestException('Overlapping working hours');
    return this.prisma.staffWorkingHours.create({
      data: { staffId, dayOfWeek, startTime, endTime },
    });
  }

  async addDayOff(staffId: string, date: Date, reason?: string) {
    return this.prisma.staffDayOff.create({ data: { staffId, date, reason } });
  }
}
