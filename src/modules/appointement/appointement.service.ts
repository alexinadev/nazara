import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { addMinutes, isBefore } from 'date-fns';
import { AppointmentStatus, Role } from '../../generated/prisma/client.js';

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
  ) {}

  async validateAvailability(staffId: string, start: Date, duration: number) {
    const end = addMinutes(start, duration);

    // check staff day off on that date
    const dayOff = await this.prisma.staffDayOff.findFirst({
      where: {
        staffId,
        date: {
          gte: new Date(start.toDateString()),
          lt: addMinutes(new Date(start.toDateString()), 24 * 60),
        },
      },
    });
    if (dayOff) throw new BadRequestException('Staff is off that day');

    // fetch non-cancelled appointments of staff
    const appointments = await this.prisma.appointment.findMany({
      where: { staffId, NOT: { status: AppointmentStatus.CANCELLED } },
    });

    for (const ap of appointments) {
      const apStart = ap.scheduledAt;
      const apEnd = addMinutes(apStart, ap.duration);
      if (apStart < end && apEnd > start) {
        throw new ConflictException(
          'Requested time overlaps with existing appointment',
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

    // compute price: prefer staffService price, else service base price
    let basePrice = 0;
    const staffService = await this.prisma.staffService.findFirst({
      where: { staffId: dto.staffId },
    });
    if (staffService) basePrice = staffService.price ?? 0;
    else if (dto.serviceId) {
      const svc = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });
      basePrice = svc?.basePrice ?? 0;
    }

    let total = basePrice;
    const appliedDiscounts: { discountId: string; appliedAmount: number }[] =
      [];

    if (dto.discountCode) {
      const discount = await this.prisma.discount.findUnique({
        where: { code: dto.discountCode },
      });
      if (discount && discount.active) {
        const appliedAmount = discount.percentage
          ? total * (discount.percentage / 100)
          : (discount.amount ?? 0);
        total = Math.max(0, total - appliedAmount);
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

    // notifications
    await this.notification.createNotification(
      appointment.customerId,
      Role.CUSTOMER,
      'Appointment Created',
      `Your appointment is scheduled at ${appointment.scheduledAt}`,
    );
    await this.notification.createNotification(
      appointment.staffId,
      Role.STAFF,
      'New Appointment',
      `New appointment at ${appointment.scheduledAt}`,
    );

    return appointment;
  }

  async cancelAppointment(requesterId: string, appointmentId: string) {
    const ap = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!ap) throw new NotFoundException('Appointment not found');

    const isOwner = ap.customerId === requesterId || ap.staffId === requesterId;
    if (!isOwner)
      throw new BadRequestException(
        'Not authorized to cancel this appointment',
      );

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
      Role.CUSTOMER,
      'Appointment Cancelled',
      `Your appointment at ${ap.scheduledAt} was cancelled`,
    );

    return updated;
  }

  async markDone(appointmentId: string) {
    const ap = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.DONE },
    });
    await this.prisma.appointmentLog.create({
      data: {
        appointmentId,
        status: AppointmentStatus.DONE,
        note: 'Marked done',
      },
    });
    return ap;
  }
}
