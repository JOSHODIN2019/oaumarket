import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface AuthenticatedAdmin {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('ADMIN_JWT_SECRET');
    if (!secret) {
      throw new Error('ADMIN_JWT_SECRET is not configured.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: { sub: string; name: string; email: string }): AuthenticatedAdmin {
    return { id: payload.sub, name: payload.name, email: payload.email };
  }
}
