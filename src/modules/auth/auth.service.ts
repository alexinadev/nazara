import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Res,
  // Inject,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MockSMSProvider } from '../../common/utils/sms.mock';
import { addMinutes, isBefore } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import { hashData, compareHash } from '../../common/utils/hash';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../generated/prisma/client.js';
import { ResponseOtpDto } from './dto/request-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private cfg: ConfigService,
    private sms: MockSMSProvider,
  ) {}

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  }

  /**
   * Request OTP: store OTP in DB and send via mock SMS
   */
  async requestOtp(phone: string) {
    const code = this.generateOtpCode();
    const expiresAt = addMinutes(new Date(), 5);

    await this.prisma.oTP.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    await this.sms.sendSMS(
      phone,
      `Your verification code: ${code} (valid 5 minutes)`,
    );

    return { phone, code, expiresAt: expiresAt.getTime() } as ResponseOtpDto;
  }

  /**
   * Verify OTP: validate, create or find user, return tokens
   */
  async verifyOtp(
    phone: string,
    code: string,
    role?: 'customer' | 'staff' | 'admin',
  ) {
    const otp = await this.prisma.oTP.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) throw new UnauthorizedException('OTP not found');
    if (otp.code !== code) throw new UnauthorizedException('Invalid OTP code');
    if (isBefore(otp.expiresAt, new Date())) {
      // delete expired OTP record
      await this.prisma.oTP
        .deleteMany({ where: { id: otp.id } })
        .catch(() => {});
      throw new UnauthorizedException('OTP expired');
    }

    // Determine role
    let targetRole: Role = Role.CUSTOMER;
    if (role === 'staff') targetRole = Role.STAFF;
    if (role === 'admin') targetRole = Role.ADMIN;

    // If staff role, ensure a staff user exists; otherwise ensure a customer exists
    let userId: string;
    const userPhone: string = phone;
    const userRole: Role = targetRole;

    if (targetRole === Role.STAFF) {
      let staff = await this.prisma.staff.findUnique({ where: { phone } });
      if (!staff) {
        // create minimal staff record; salonId required — pick first salon if exists
        const salon = await this.prisma.salon.findFirst();
        if (!salon) {
          throw new BadRequestException(
            'No salon exists. Create a salon first or verify role.',
          );
        }
        staff = await this.prisma.staff.create({
          data: {
            salonId: salon.id,
            phone,
            firstName: 'Staff',
            lastName: 'User',
            role: Role.STAFF,
          },
        });
      }
      userId = staff.id;
    } else if (targetRole === Role.ADMIN) {
      // Admins might be represented by Staff with role ADMIN or by Staff table; we'll try Staff first
      let staff = await this.prisma.staff.findUnique({ where: { phone } });
      if (!staff) {
        const salon = await this.prisma.salon.findFirst();
        if (!salon)
          throw new BadRequestException(
            'No salon exists. Create a salon first or verify role.',
          );
        staff = await this.prisma.staff.create({
          data: {
            salonId: salon.id,
            phone,
            firstName: 'Admin',
            lastName: 'User',
            role: Role.ADMIN,
          },
        });
      } else if (staff.role !== Role.ADMIN) {
        // update role to admin
        staff = await this.prisma.staff.update({
          where: { id: staff.id },
          data: { role: Role.ADMIN },
        });
      }
      userId = staff.id;
    } else {
      let customer = await this.prisma.customer.findUnique({
        where: { phone },
      });
      if (!customer) {
        customer = await this.prisma.customer.create({ data: { phone } });
      }
      userId = customer.id;
    }

    // Build payload
    const payload = { userId, userRole: userRole, phone: userPhone };

    const accessToken = this.jwt.sign(payload, {
      secret:
        this.cfg.get<string>('jwt.accessSecret') ||
        process.env.JWT_ACCESS_SECRET,
      expiresIn:
        this.cfg.get<string>('jwt.accessExpiration') ||
        process.env.JWT_ACCESS_EXPIRATION ||
        '15m',
    } as any);

    const refreshToken = this.jwt.sign(payload, {
      secret:
        this.cfg.get<string>('jwt.refreshSecret') ||
        process.env.JWT_REFRESH_SECRET,
      expiresIn:
        this.cfg.get<string>('jwt.refreshExpiration') ||
        process.env.JWT_REFRESH_EXPIRATION ||
        '7d',
    } as any);

    // Hash refresh token and store in DeviceToken (per schema)
    const hashed = await hashData(refreshToken);
    // store associated device token; userRole stored as Role enum
    await this.prisma.deviceToken.create({
      data: {
        token: hashed,
        userRole,
        staffId:
          userRole === Role.STAFF || userRole === Role.ADMIN ? userId : null,
        customerId: userRole === Role.CUSTOMER ? userId : null,
      },
    });

    // Remove used OTPs for this phone
    await this.prisma.oTP.deleteMany({ where: { phone } }).catch(() => {});

    return {
      accessToken,
      refreshToken,
      user: { id: userId, role: userRole, phone: userPhone },
    };
  }

  /**
   * Refresh tokens: validate provided refresh token against latest hashed token stored for user
   */
  async refreshTokens(userId: string, refreshToken: string) {
    // find device token records for userId
    const tokens = await this.prisma.deviceToken.findMany({
      where: {
        OR: [{ staffId: userId }, { customerId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (!tokens || tokens.length === 0)
      throw new UnauthorizedException('No refresh token registered');

    // Try to find a token that matches the provided refreshToken
    let matched = null;
    for (const rec of tokens) {
      try {
        const ok = await compareHash(refreshToken, rec.token);
        if (ok) {
          matched = rec;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!matched) throw new UnauthorizedException('Invalid refresh token');

    // payload extraction: verify refresh token JWT to get payload
    let payload: any;
    try {
      payload = this.jwt.verify(refreshToken, {
        secret:
          this.cfg.get<string>('jwt.refreshSecret') ||
          process.env.JWT_REFRESH_SECRET,
      } as any);
    } catch (err) {
      throw new UnauthorizedException(
        'Invalid refresh token: verification failed',
      );
    }

    // build new tokens
    const newPayload = {
      userId: payload.userId,
      userRole: payload.userRole,
      phone: payload.phone,
    };

    const newAccess = this.jwt.sign(newPayload, {
      secret:
        this.cfg.get<string>('jwt.accessSecret') ||
        process.env.JWT_ACCESS_SECRET,
      expiresIn:
        this.cfg.get<string>('jwt.accessExpiration') ||
        process.env.JWT_ACCESS_EXPIRATION ||
        '15m',
    } as any);

    const newRefresh = this.jwt.sign(newPayload, {
      secret:
        this.cfg.get<string>('jwt.refreshSecret') ||
        process.env.JWT_REFRESH_SECRET,
      expiresIn:
        this.cfg.get<string>('jwt.refreshExpiration') ||
        process.env.JWT_REFRESH_EXPIRATION ||
        '7d',
    } as any);

    const hashed = await hashData(newRefresh);
    await this.prisma.deviceToken.create({
      data: {
        token: hashed,
        userRole: payload.userRole,
        staffId:
          payload.userRole === Role.STAFF || payload.userRole === Role.ADMIN
            ? payload.userId
            : null,
        customerId: payload.userRole === Role.CUSTOMER ? payload.userId : null,
      },
    });

    return { accessToken: newAccess, refreshToken: newRefresh };
  }

  async revokeTokens(userId: string) {
    await this.prisma.deviceToken.deleteMany({
      where: {
        OR: [{ staffId: userId }, { customerId: userId }],
      },
    });
    return { success: true };
  }
}
