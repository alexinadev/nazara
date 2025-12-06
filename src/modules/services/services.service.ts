import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.service.create({ data });
  }

  async findAll(page = 1, perPage = 20, q?: string) {
    const where: any = {};
    if (q) where.name = { contains: q, mode: 'insensitive' };
    const items = await this.prisma.service.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
    });
    const total = await this.prisma.service.count({ where });
    return { items, total, page, perPage };
  }

  async findOne(id: string) {
    const svc = await this.prisma.service.findUnique({
      where: { id },
      include: { options: true },
    });
    if (!svc) throw new NotFoundException('Service not found');
    return svc;
  }

  async update(id: string, data: any) {
    return this.prisma.service.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.service.delete({ where: { id } });
  }
}
