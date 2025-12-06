import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: any) {
    const ap = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });
    if (!ap) throw new BadRequestException('Appointment not found');
    if (ap.customerId !== customerId)
      throw new BadRequestException('Not allowed to review this appointment');

    // ensure no existing review for appointment (appointmentId is unique in Review model)
    const existing = await this.prisma.review
      .findUnique({ where: { appointmentId: dto.appointmentId } as any })
      .catch(() => null);
    if (existing) throw new BadRequestException('Appointment already reviewed');

    const review = await this.prisma.review.create({
      data: {
        appointmentId: dto.appointmentId,
        customerId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    for (const cs of dto.criteriaScores) {
      await this.prisma.reviewCriteriaScore.create({
        data: {
          reviewId: review.id,
          criteriaId: cs.criteriaId,
          score: cs.score,
        },
      });
    }

    return review;
  }
}
