import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaService } from './database/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SalonModule } from './modules/salon/salon.module';
import { StaffModule } from './modules/staff/staff.module';
import { ServicesModule } from './modules/services/services.module';
import { AppointmentModule } from './modules/appointement/appointement.module';
import { ReviewModule } from './modules/review/review.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { DiscountModule } from './modules/discount/discount.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PaymentModule } from './modules/payment/payment.module';
import { FavoritesModule } from './modules/favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    AuthModule,
    UserModule,
    SalonModule,
    StaffModule,
    ServicesModule,
    AppointmentModule,
    ReviewModule,
    GalleryModule,
    DiscountModule,
    NotificationModule,
    PaymentModule,
    FavoritesModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
