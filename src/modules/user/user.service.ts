import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findCustomerByPhone(phone: string) {
    return this.prisma.customer.findUnique({ where: { phone } });
  }

  async updateCustomer(id: string, dto: UpdateUserDto) {
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async updateStaff(id: string, dto: UpdateUserDto) {
    return this.prisma.staff.update({ where: { id }, data: dto });
  }

  async getProfile(id: string, role: string) {
    if (!id) throw new NotFoundException('User id required');
    if (role === 'STAFF' || role === 'staff') {
      const staff = await this.prisma.staff.findUnique({ where: { id } });
      if (!staff) throw new NotFoundException('Staff not found');
      return staff;
    }
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}
