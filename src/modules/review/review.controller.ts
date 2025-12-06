import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private svc: ReviewService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.svc.create(user.id, dto);
  }
}
