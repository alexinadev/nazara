import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async favoriteSalon(customerId: string, salonId: string) {
    return this.prisma.favoriteSalon.create({ data: { customerId, salonId }});
  }

  async unfavoriteSalon(customerId: string, salonId: string) {
    return this.prisma.favoriteSalon.deleteMany({ where: { customerId, salonId }});
  }

  async favoriteStaff(customerId: string, staffId: string) {
    return this.prisma.favoriteStaff.create({ data: { customerId, staffId }});
  }
}
