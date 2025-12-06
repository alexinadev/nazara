import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.get('jwt.accessSecret'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // payload contains userId, userRole, phone as per sign
    return { id: payload.userId, role: payload.userRole, phone: payload.phone };
  }
}
