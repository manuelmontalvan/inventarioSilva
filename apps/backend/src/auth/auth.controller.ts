import {
  Controller,
  Get,
  Post,
  Request,
  Res,
  Req,
  UseGuards,
  Body,
  Patch,
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
import { MailService } from './mail.service';

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
    private readonly mailService: MailService,
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

    res.cookie('token', tokens.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2, // 15 minutos
    });

    res.cookie('refreshToken', tokens.refreshToken, {
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
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    const payload = this.jwtService.verify(token);
    if (!payload?.sub) throw new UnauthorizedException('Token inválido');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(payload.sub, hashedPassword);
    return { message: 'Contraseña actualizada' };
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    const user = await this.usersService.findOne(req.user.sub);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      throw new UnauthorizedException('Contraseña actual incorrecta');

    const newHashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, newHashed);
    return { message: 'Contraseña actualizada' };
  }
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const token = this.jwtService.sign({ sub: user.id }, { expiresIn: '15m' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailService.sendResetPasswordEmail(user.email, link);

    return { message: 'Enlace enviado al correo' };
  }
  @Post('validate-reset-token')
  async validateResetToken(@Body('token') token: string) {
    return this.authService.validateResetToken(token);
  }
}
