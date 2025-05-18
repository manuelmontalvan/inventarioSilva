import { Controller, Post, Request, UseGuards, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

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

      const payload = { sub: user.id, email: user.email, role: user.role.name};
      return {
        access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}

