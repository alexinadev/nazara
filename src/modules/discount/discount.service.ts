import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.discount.create({ data });
  }

  async findByCode(code: string) {
    return this.prisma.discount.findUnique({ where: { code } });
  }

  async list() {
    return this.prisma.discount.findMany();
  }
}
