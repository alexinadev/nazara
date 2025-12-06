// import { Module } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';

// @Module({
//   controllers: [AuthController],
//   providers: [AuthService],
// })
// export class AuthModule {}
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RefreshStrategy } from './refresh.strategy';
import { MockSMSProvider } from '../../common/utils/sms.mock';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot({ ttl: 60 * 60, limit: 5 }), // general
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(cfg: ConfigService) {
        return {
          secret: cfg.get('jwt.accessSecret'),
          signOptions: { expiresIn: cfg.get('jwt.accessExpiration') },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    RefreshStrategy,
    MockSMSProvider,
  ],
  exports: [AuthService],
})
export class AuthModule {}
