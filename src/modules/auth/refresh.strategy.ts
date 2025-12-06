import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    // Note: Passport strategy for refresh is optional in our flow.
    // We'll implement server-side refresh logic in AuthService; keep this for completeness.
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
      ignoreExpiration: false,
    } as any);
  }

  async validate(req: any, payload: any) {
    // payload contains userId, userRole, phone
    return payload;
  }
}
