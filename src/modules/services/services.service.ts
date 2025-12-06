import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.service.create({ data });
  }

  async findAll(salonId?: string) {
    return this.prisma.service.findMany();
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({ where: { id }, include: { options: true }});
  }

  async update(id: string, dto: any) {
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.service.delete({ where: { id }});
  }
}
