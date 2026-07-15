import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import * as dotenv from 'dotenv';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants';

dotenv.config();

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const token = req?.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
        if (!token) return null;
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET || 'fallback_refresh_secret',
    });
  }

  async validate(payload: any) {
    if (!payload?.sub) throw new UnauthorizedException('Invalid refresh token');
    return { 
      userId: payload.sub, 
      email: payload.email 
    };
  }
}
