import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SalonService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.salon.create({ data });
  }

  async findAll(page = 1, perPage = 10, q?: string) {
    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }
    const items = await this.prisma.salon.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.prisma.salon.count({ where });
    return { items, total, page, perPage };
  }

  async findOne(id: string) {
    const salon = await this.prisma.salon.findUnique({ where: { id } });
    if (!salon) throw new NotFoundException('Salon not found');
    return salon;
  }

  async update(id: string, data: any) {
    return this.prisma.salon.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.salon.delete({ where: { id } });
  }
}
