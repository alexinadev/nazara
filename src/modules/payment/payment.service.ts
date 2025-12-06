import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentStatus } from 'src/generated/prisma/client.js';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async record(
    appointmentId: string,
    amount: number,
    method: string,
    providerData?: any,
  ) {
    const ap = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!ap) throw new NotFoundException('Appointment not found');

    const payment = await this.prisma.payment.create({
      data: {
        appointmentId,
        amount,
        method,
        status: PaymentStatus.PAID,
        providerData,
      },
    });

    // mark appointment confirmed
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' } as any,
    });

    return payment;
  }
}
