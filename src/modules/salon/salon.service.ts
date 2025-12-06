import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SalonService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.salon.create({ data });
  }

  async findAll(page = 1, perPage = 10, filter?: any) {
    const where: any = {};
    if (filter?.q) {
      where.OR = [
        { name: { contains: filter.q, mode: 'insensitive' } },
        { description: { contains: filter.q, mode: 'insensitive' } },
      ];
    }
    const salons = await this.prisma.salon.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.prisma.salon.count({ where });
    return { items: salons, total, page, perPage };
  }

  async findOne(id: string) {
    return this.prisma.salon.findUnique({ where: { id }});
  }

  async update(id: string, data: any) {
    return this.prisma.salon.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.salon.delete({ where: { id }});
  }
}
