import { Controller, Get, UseGuards, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private svc: NotificationService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.svc.list(user.id);
  }

  @Patch(':id/read')
  mark(@Param('id') id: string) {
    return this.svc.markRead(id);
  }
}
