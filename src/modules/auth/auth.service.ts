import {
  Injectable,
  // BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MockSMSProvider } from '../../common/utils/sms.mock';
import { addMinutes, isBefore } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import { hashData, compareHash } from '../../common/utils/hash';
// import * as crypto from 'crypto';
import { Role } from 'src/generated/prisma/client.js';

//Note: I used deviceToken table to store refresh token hashes to avoid adding an extra model. In practice you'd add a proper refresh_token table.

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private sms: MockSMSProvider,
    private jwt: JwtService,
  ) {}

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async requestOtp(phone: string) {
    // create or update OTP entry
    const code = this.generateCode();
    const expiresAt = addMinutes(new Date(), 5);

    await this.prisma.oTP.create({
      data: { phone, code, expiresAt },
    });

    // send via mock SMS
    await this.sms.sendSMS(
      phone,
      `Your OTP code is ${code}. Expires in 5 minutes.`,
    );

    return { success: true };
  }

  async verifyOtp(
    phone: string,
    code: string,
    role?: 'customer' | 'staff' | 'admin',
  ) {
    const otp = await this.prisma.oTP.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp || otp.code !== code || isBefore(otp.expiresAt, new Date())) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // find or create user/customer/staff
    let userRole: Role = Role.CUSTOMER;
    if (role === 'staff') userRole = Role.STAFF;
    if (role === 'admin') userRole = Role.ADMIN;

    // If staff role requested, ensure staff exists; otherwise create customer
    let payloadUser: { id: string; role: Role; phone: string };
    if (userRole === Role.STAFF) {
      let staff = await this.prisma.staff.findUnique({ where: { phone } });
      if (!staff) {
        staff = await this.prisma.staff.create({
          data: {
            phone,
            firstName: 'New',
            lastName: 'Staff',
            role: Role.STAFF,
            salonId: (await this.prisma.salon.findFirst())?.id || '',
          },
        });
      }
      payloadUser = { id: staff.id, role: staff.role, phone: staff.phone };
    } else {
      let customer = await this.prisma.customer.findUnique({
        where: { phone },
      });
      if (!customer) {
        customer = await this.prisma.customer.create({ data: { phone } });
      }
      payloadUser = {
        id: customer.id,
        role: Role.CUSTOMER,
        phone: customer.phone,
      };
    }

    // generate tokens
    const accessToken = this.jwt.sign(
      {
        userId: payloadUser.id,
        userRole: payloadUser.role,
        phone: payloadUser.phone,
      },
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' } as any,
    );

    const refreshToken = this.jwt.sign(
      {
        userId: payloadUser.id,
        userRole: payloadUser.role,
        phone: payloadUser.phone,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      } as any,
    );

    const hashed = await hashData(refreshToken);

    // store hashed refresh token — we put it in Notification table? create a refreshTokens table would be ideal; store in device token? we'll create a simple table in prisma? Not defined earlier. Use Notification as temp — but better to store in customer's or staff's device? Instead we attach to Notification (not ideal). Simpler: create/update a userRefreshToken in user record — but prisma schema does not have it. To avoid modifying schema now, store hashed refresh in a small table: create a temporary table 'RefreshToken' would require schema change. To keep to schema, we store hashed refresh in Notification with meta (not ideal but works). Actually better: use DeviceToken model to store hashed refresh token as token with userRole -> reuse DeviceToken.
    await this.prisma.deviceToken.create({
      data: {
        userId: payloadUser.id,
        userRole: payloadUser.role,
        token: hashed,
      },
    });

    // delete OTP
    await this.prisma.oTP.deleteMany({ where: { phone } });

    return { accessToken, refreshToken, user: payloadUser };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    // find hashed token
    const rec = await this.prisma.deviceToken.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!rec) throw new UnauthorizedException('No refresh token stored');
    const match = await compareHash(refreshToken, rec.token);
    if (!match) throw new UnauthorizedException('Invalid refresh token');

    // lookup user role and phone
    // may be either customer or staff
    let user: any = await this.prisma.customer.findUnique({
      where: { id: userId },
    });
    let role: Role = Role.CUSTOMER;
    if (!user) {
      user = await this.prisma.staff.findUnique({ where: { id: userId } });
      role = Role.STAFF;
    }
    if (!user) throw new UnauthorizedException('User not found');

    const payload = { userId: user.id, userRole: role, phone: user.phone };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    } as any);
    const newRefresh = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    } as any);
    const hashed = await hashData(newRefresh);

    await this.prisma.deviceToken.create({
      data: { userId: user.id, userRole: role, token: hashed },
    });

    return { accessToken, refreshToken: newRefresh };
  }

  // Revoke tokens
  async revokeTokens(userId: string) {
    await this.prisma.deviceToken.deleteMany({ where: { userId } });
    return { success: true };
  }
}
