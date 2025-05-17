import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'eros',
      password: 'eros2021',
      database: 'inventarioSilva',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // solo para desarrollo
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
