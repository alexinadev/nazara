import { Module } from '@nestjs/common';
import { AppointmentService } from './appointement.service';
import { AppointmentController } from './appointement.controller';
import { PrismaService } from '../../database/prisma.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AppointmentController],
  providers: [AppointmentService, PrismaService],
})
export class AppointmentModule {}
