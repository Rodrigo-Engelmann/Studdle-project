import { 
  Controller, 
  Post, 
  Body, 
  Res, 
  Req, 
  Get, 
  UseGuards, 
  HttpCode, 
  HttpStatus, 
  BadRequestException,
  Put, 
  UploadedFile, 
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import * as dotenv from 'dotenv';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from './constants';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';

import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from '../users/users.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { diskStorage } from 'multer';
import { extname } from 'path';



dotenv.config();

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,

    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // REGISTER
  @Post('register')
  async register(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user_name, email, password } = body;

    if (!user_name || !email || !password) {
      throw new BadRequestException('Dados incompletos');
    }

    // Verificar se email já existe
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('E-mail já registrado');
    }

    // Hash da senha
    const hashed = await bcrypt.hash(password, 10);

    // Criar user
    const newUser = this.usersRepo.create({
      user_name,
      email,
      password: hashed,
    });

    const savedUser = await this.usersRepo.save(newUser);

    // Gerar tokens
    const { accessToken, refreshToken } = await this.authService.login(savedUser);

    // Salvar cookies (EXATAMENTE como no login)
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 25 * 60 * 1000,
      path: '/',
    });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 20 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    const { password: _, ...safeUser } = savedUser;

    return {
      ok: true,
      message: 'Usuário registrado com sucesso!',
      user: safeUser,
    };
  }

  // LOGIN
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      return { ok: false, message: 'Credenciais inválidas' };
    }

    const { accessToken, refreshToken } = await this.authService.login(
      user,
      dto.deviceInfo,
    );

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 25 * 60 * 1000,
      path: '/',
    });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 20 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    const { password, ...safeUser } = user;

    return { ok: true, user: safeUser };
  }

  // LOGOUT
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });

    if (refreshToken) {
      try {
        await this.authService.logout(refreshToken);
      } catch (err) {
        console.error('Erro ao revogar refresh token:', err);
      }
    }

    return { ok: true };
  }

  // PROFILE (rota protegida)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req: any) {
    return { user: req.user };
  }



  

  // DEBUG - VER COOKIES
  @Get('debug-cookie')
  debugCookie(@Req() req: Request) {
    return { cookies: req.cookies };
  }

  // REFRESH TOKEN
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refreshTokens(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshTokensByUserId(req.user.userId);

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 25 * 60 * 1000,
      path: '/',
    });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 20 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { ok: true, user: result.user };
  }



  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: 'uploads/profile',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      const allowed = /\/(jpg|jpeg|png|gif|webp)$/;
      if (!file.mimetype.match(allowed))
        return callback(new Error('Apenas imagens são permitidas para a foto de perfil'), false);

      callback(null, true);
    },
  }))

  async updateProfile(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    // Atualiza o usuário
    const updatedUser = await this.userService.updateUser(req.user.id, body, file);

    // Gerar novos tokens com os dados atualizados
    const { accessToken, refreshToken } = await this.authService.login(updatedUser);

    // Atualizar cookies
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 25 * 60 * 1000,
      path: '/',
    });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 20 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    const user = req.user;

    return {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
    };
  }

}
