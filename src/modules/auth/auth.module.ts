import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RefreshStrategy } from './refresh.strategy';
import { MockSMSProvider } from 'src/common/utils/sms.mock';
import { ThrottlerOtpGuard } from '../../common/guards/throttler-otp.guard';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: parseInt(
            configService.getOrThrow<string>('jwt.accessExpiration') ||
              process.env.JWT_ACCESS_EXPIRATION ||
              '15m',
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    RefreshStrategy,
    MockSMSProvider,
    ThrottlerOtpGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
