import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private svc: FavoritesService) {}

  @Post('salon')
  favSalon(@CurrentUser() user: any, @Body() body: { salonId: string }) {
    return this.svc.favoriteSalon(user.id, body.salonId);
  }

  @Post('staff')
  favStaff(@CurrentUser() user: any, @Body() body: { staffId: string }) {
    return this.svc.favoriteStaff(user.id, body.staffId);
  }
}
