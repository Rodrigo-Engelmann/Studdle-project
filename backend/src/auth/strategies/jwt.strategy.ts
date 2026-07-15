// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import * as dotenv from 'dotenv';
import { ACCESS_TOKEN_COOKIE_NAME } from '../constants';

import { UserService } from '../../users/users.service';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      // PEGAR TOKEN DO COOKIE
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (req?.cookies?.[ACCESS_TOKEN_COOKIE_NAME]) {
            return req.cookies[ACCESS_TOKEN_COOKIE_NAME];
          }
          return null;
        },
      ]),

      // NÃO ignorar expiração
      ignoreExpiration: false,

      // chave secreta do access token
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET!
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}
