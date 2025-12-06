import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AppointmentStatus } from 'src/generated/prisma/client.js';
import { addMinutes, isBefore, isAfter } from 'date-fns';

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
  ) {}

  // check overlapping appointments for a staff
  async validateAvailability(staffId: string, start: Date, duration: number) {
    const end = addMinutes(start, duration);
    // check day off
    const dayOff = await this.prisma.staffDayOff.findFirst({
      where: {
        staffId,
        date: {
          gte: new Date(start.toDateString()),
          lt: addMinutes(new Date(start.toDateString()), 24 * 60),
        },
      },
    });
    if (dayOff) throw new BadRequestException('Staff is off on this date');

    const overlaps = await this.prisma.appointment.findFirst({
      where: {
        staffId,
        AND: [
          { scheduledAt: { lte: end } },
          { scheduledAt: { gte: addMinutes(start, -10000) } }, // approximate earlier appointments
        ],
        NOT: { status: AppointmentStatus.CANCELLED },
      },
    });

    // better overlap check: find appointments with start < end and (start + duration) > start
    const appointments = await this.prisma.appointment.findMany({
      where: { staffId, NOT: { status: AppointmentStatus.CANCELLED } },
    });
    for (const ap of appointments) {
      const apStart = ap.scheduledAt;
      const apEnd = addMinutes(apStart, ap.duration);
      if (apStart < end && apEnd > start) {
        throw new ConflictException(
          'Time slot overlaps with existing appointment',
        );
      }
    }

    return true;
  }

  async createAppointment(customerId: string, dto: any) {
    const start = new Date(dto.scheduledAt);
    if (isBefore(start, new Date()))
      throw new BadRequestException('Cannot book in the past');

    await this.validateAvailability(dto.staffId, start, dto.duration);

    // calculate price
    const staffService = await this.prisma.staffService.findFirst({
      where: { staffId: dto.staffId },
    });
    const basePrice =
      staffService?.price ??
      (await this.prisma.service.findUnique({ where: { id: dto.serviceId } }))
        ?.basePrice ??
      0;

    let total = basePrice;

    // apply discount if any
    let appliedDiscounts = [];
    if (dto.discountCode) {
      const discount = await this.prisma.discount.findUnique({
        where: { code: dto.discountCode },
      });
      if (discount && discount.active) {
        const appliedAmount = discount.percentage
          ? total * (discount.percentage / 100)
          : discount.amount || 0;
        total = total - appliedAmount;
        appliedDiscounts.push({ discountId: discount.id, appliedAmount });
      }
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        salonId: dto.salonId,
        staffId: dto.staffId,
        customerId,
        scheduledAt: start,
        duration: dto.duration,
        totalPrice: total,
        notes: dto.notes,
        status: AppointmentStatus.PENDING,
      },
    });

    // save discount relations
    for (const d of appliedDiscounts) {
      await this.prisma.appointmentDiscount.create({
        data: {
          appointmentId: appointment.id,
          discountId: d.discountId,
          appliedAmount: d.appliedAmount,
        },
      });
    }

    await this.prisma.appointmentLog.create({
      data: {
        appointmentId: appointment.id,
        status: AppointmentStatus.PENDING,
        note: 'Created',
      },
    });
    // notification
    await this.notification.createNotification(
      appointment.customerId,
      'CUSTOMER',
      'Appointment Created',
      `Appointment on ${appointment.scheduledAt} created`,
    );
    await this.notification.createNotification(
      appointment.staffId,
      'STAFF',
      'New Appointment',
      `You have a new appointment on ${appointment.scheduledAt}`,
    );

    return appointment;
  }

  async cancelAppointment(userId: string, appointmentId: string) {
    const ap = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!ap) throw new NotFoundException('Appointment not found');
    if (ap.customerId !== userId && ap.staffId !== userId)
      throw new BadRequestException('Not allowed to cancel');
    if (ap.status === AppointmentStatus.CANCELLED)
      throw new BadRequestException('Already cancelled');
    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
    });
    await this.prisma.appointmentLog.create({
      data: {
        appointmentId,
        status: AppointmentStatus.CANCELLED,
        note: 'Cancelled by user',
      },
    });
    await this.notification.createNotification(
      ap.customerId,
      'CUSTOMER',
      'Appointment Cancelled',
      `Appointment on ${ap.scheduledAt} was cancelled`,
    );
    return updated;
  }

  async markDone(appointmentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const ap = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.DONE },
      });
      await tx.appointmentLog.create({
        data: {
          appointmentId,
          status: AppointmentStatus.DONE,
          note: 'Completed',
        },
      });
      return ap;
    });
  }
}
