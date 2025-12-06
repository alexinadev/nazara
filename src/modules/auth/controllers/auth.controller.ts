// src/modules/auth/controllers/auth.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { RequestOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ThrottlerOtpGuard } from 'src/common/guards/throttler-otp.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private jwt: JwtService,
  ) {}

  @UseGuards(ThrottlerOtpGuard)
  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto.phone);
  }

  @HttpCode(200)
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.phone, dto.code, dto.role);
  }

  @HttpCode(200)
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refreshTokens(dto.userId, dto.refreshToken);
  }

  @Post('revoke')
  async revoke(@Body() body: { userId: string }) {
    return this.auth.revokeTokens(body.userId);
  }
}
