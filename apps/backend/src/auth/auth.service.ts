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
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

 async login(user: any) {
  const payload = { sub: user.id, email: user.email, role: user.role?.name, };
  const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
  const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

  // Guarda el refreshToken en la base de datos
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);
    
  // ACTUALIZA EL CAMPO lastLogin
  await this.usersService.update(user.id, { lastLogin: new Date() });
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}


}
