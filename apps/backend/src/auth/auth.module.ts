import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,

   JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const secret = configService.get<string>('JWT_SECRET');
  
    return {
      secret,
      signOptions: { expiresIn: '1d' },
    };
  },
  inject: [ConfigService],
}),

  ],
  providers: [AuthService, LocalStrategy, JwtStrategy,MailService],
  controllers: [AuthController],
})
export class AuthModule {}
