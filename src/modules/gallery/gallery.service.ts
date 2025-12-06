import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async add(data: any) {
    return this.prisma.gallery.create({ data });
  }

  async listBySalon(salonId: string) {
    return this.prisma.gallery.findMany({ where: { salonId } });
  }

  async listByStaff(staffId: string) {
    return this.prisma.gallery.findMany({ where: { staffId } });
  }
}
