import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: any) {
    // ensure appointment exists and belongs to customer
    const ap = await this.prisma.appointment.findUnique({ where: { id: dto.appointmentId }});
    if (!ap || ap.customerId !== customerId) throw new BadRequestException('Invalid appointment');

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
        data: { reviewId: review.id, criteriaId: cs.criteriaId, score: cs.score },
      });
    }

    return review;
  }
}
