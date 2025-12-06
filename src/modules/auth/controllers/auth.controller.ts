import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { RequestOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ThrottlerOtpGuard } from '../../../common/guards/throttler-otp.guard';
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

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.phone, dto.code, dto.role);
  }

  @Post('refresh')
  async refresh(@Body() body: { userId: string; refreshToken: string }) {
    return this.auth.refreshTokens(body.userId, body.refreshToken);
  }

  @Post('revoke')
  async revoke(@Body() body: { userId: string }) {
    return this.auth.revokeTokens(body.userId);
  }
}
