import {
  Controller,
  Get,
  Post,
  Request,
  Req,
  UseGuards,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { NotFoundException } from '@nestjs/common/exceptions';

import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    try {
      const decoded = this.jwtService.verify(body.refresh_token);
      const user = await this.usersService.findByEmail(decoded.email);
      if (!user || user.refreshToken !== body.refresh_token) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const payload = { sub: user.id, email: user.email, role: user.role.name };
      return {
        access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      };
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

}
