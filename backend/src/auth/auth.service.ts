import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private tokensRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  //  NOVOS MÉTODOS — findByEmail e registerUser

  async findByEmail(email: string) {
    return await this.usersRepo.findOne({ where: { email } });
  }

  async registerUser(dto: { user_name: string; email: string; password: string }) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email já está em uso');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      user_name: dto.user_name,
      email: dto.email,
      password: hashed,
    });

    return await this.usersRepo.save(user);
  }

  //  LOGIN E VALIDAÇÃO

  async validateUser(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) return null;

    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;

    return user;
  }

  private getAccessToken(user: User) {
    const payload = {
      sub: user.id,
      user_name: user.user_name,
      email: user.email,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET!,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '25m',
    });
  }

  private getRefreshToken(user: User) {
    return crypto.randomBytes(64).toString('hex');
  }

  async createRefreshToken(user: User, deviceInfo?: string) {
    const token = this.getRefreshToken(user);
    const tokenHash = await bcrypt.hash(token, 10);

    const expiresAt = new Date();
    const days = parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRATION?.replace('d', '') || '20',
      10,
    );
    expiresAt.setDate(expiresAt.getDate() + days);

    const rt = this.tokensRepo.create({
      tokenHash,
      expiresAt,
      deviceInfo: deviceInfo ?? undefined,
      user,
    });

    await this.tokensRepo.save(rt);
    return token;
  }

  async rotateRefreshToken(
    user: User,
    providedToken: string,
    deviceInfo?: string,
  ) {
    const tokens = await this.tokensRepo.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });

    for (const t of tokens) {
      if (t.expiresAt.getTime() < Date.now()) continue;

      const match = await bcrypt.compare(providedToken, t.tokenHash);
      if (match) {
        await this.tokensRepo.remove(t);
        const newToken = await this.createRefreshToken(user, deviceInfo);
        return newToken;
      }
    }

    throw new UnauthorizedException('Refresh token inválido');
  }

  async login(user: User, deviceInfo?: string) {
    const accessToken = this.getAccessToken(user);
    const refreshToken = await this.createRefreshToken(user, deviceInfo);

    return { accessToken, refreshToken, user };
  }

  async refreshTokens(providedToken: string) {
    const tokens = await this.tokensRepo.find({ relations: ['user'] });

    for (const t of tokens) {
      if (t.expiresAt.getTime() < Date.now()) continue;

      const match = await bcrypt.compare(providedToken, t.tokenHash);
      if (match) {
        const user = t.user;

        await this.tokensRepo.remove(t);
        const newRefresh = await this.createRefreshToken(user);

        const newAccess = this.jwtService.sign(
          {
            sub: user.id,
            user_name: user.user_name,
            email: user.email,
          },
          {
            secret: process.env.JWT_ACCESS_TOKEN_SECRET!,
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '25m',
          },
        );

        return { accessToken: newAccess, refreshToken: newRefresh, user };
      }
    }

    throw new UnauthorizedException('Refresh token inválido ou expirado');
  }

  async refreshTokensByUserId(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    await this.tokensRepo.delete({ user: { id: user.id } } as any);

    const newRefresh = await this.createRefreshToken(user);
    const newAccess = this.getAccessToken(user);

    return {
      accessToken: newAccess,
      refreshToken: newRefresh,
      user,
    };
  }

  async logout(providedRefreshToken?: string, userId?: number) {
    if (providedRefreshToken) {
      const tokens = await this.tokensRepo.find({ relations: ['user'] });

      for (const t of tokens) {
        try {
          const match = await bcrypt.compare(providedRefreshToken, t.tokenHash);
          if (match) {
            await this.tokensRepo.remove(t);
          }
        } catch (err) {}
      }
      return;
    }

    if (userId) {
      await this.tokensRepo.delete({ user: { id: userId } } as any);
    }
  }
}
