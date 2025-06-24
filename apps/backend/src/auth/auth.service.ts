import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role?.name };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '2h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Guarda el refreshToken en la base de datos
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    // ACTUALIZA EL CAMPO lastLogin
    await this.usersService.update(user.id, { lastLogin: new Date() });
    return {
      token: accessToken,
      refreshToken: refreshToken,
    };
  }

  // auth.service.ts
  generateResetToken(userId: string): string {
    return this.jwtService.sign({ sub: userId }, { expiresIn: '30m' });
  }
  validateResetToken(token: string): { sub: string } {
  try {
    const payload = this.jwtService.verify(token);
    if (!payload?.sub) throw new UnauthorizedException('Token inválido');
    return payload;
  } catch (error) {
    throw new UnauthorizedException('Token inválido o expirado');
  }
}

}
