import {
  Controller,
  Get,
  Post,
  Request,
  Res,
  Req,
  UseGuards,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common/exceptions';

import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { Request as ExpressRequest, Response } from 'express';

interface RequestWithCookies extends ExpressRequest {
  cookies: {
    refreshToken?: string;
    token?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(LocalAuthGuard)
  // auth.controller.ts
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const tokens = await this.authService.login(user);

    res.cookie('token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15, // 15 minutos
    });

    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    });

    return { message: 'Login exitoso' };
  }

  @Post('refresh')
  async refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refresh_token = req.cookies?.refreshToken;
    if (!refresh_token) {
      throw new UnauthorizedException('No se encontró refresh token');
    }

    try {
      const decoded = this.jwtService.verify(refresh_token);
      const user = await this.usersService.findByEmail(decoded.email);
      if (
        !user ||
        !user.refreshToken || // validamos que exista refreshToken
        !(await bcrypt.compare(refresh_token, user.refreshToken))
      ) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const payload = { sub: user.id, email: user.email, role: user.role.name };
      const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });

      res.cookie('token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 15, // 15 min
      });

      return { message: 'Token renovado' };
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  async getProfile(@Request() req) {
    const userId = req.user.id;
    const user = await this.usersService.findByIdWithRelations(userId); // Nueva función que verás abajo

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Opcional: quitar contraseña del response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  @Post('logout')
  async logout(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = this.jwtService.verify(refreshToken);
        await this.usersService.updateRefreshToken(decoded.sub, '');
      } catch (err) {
        // ignorar error de token expirado
      }
    }

    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });


    return { message: 'Sesión cerrada' };
  }
}
