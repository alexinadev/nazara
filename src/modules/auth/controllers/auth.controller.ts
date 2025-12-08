// src/modules/auth/controllers/auth.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { RequestOtpDto, ResponseOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ThrottlerOtpGuard } from 'src/common/guards/throttler-otp.guard';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private jwt: JwtService,
  ) {}

  @ApiResponse({ status: 201, type: ResponseOtpDto, description: 'OTP requested successfully.' })
  @UseGuards(ThrottlerOtpGuard)
  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    const response = await this.auth.requestOtp(dto.phone);
    console.log('OTP Response:', response);
    return response;
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
