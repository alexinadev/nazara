import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async record(appointmentId: string, amount: number, method: string, providerData?: any) {
    const pay = await this.prisma.payment.create({
      data: { appointmentId, amount, method, providerData, status: PaymentStatus.PAID },
    });
    await this.prisma.appointment.update({ where: { id: appointmentId }, data: { status: 'CONFIRMED' }});
    return pay;
  }
}
