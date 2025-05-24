import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { RolesModule } from './users/roles/roles.module';
import { RolesSeed } from './users/roles/roles.seed';
import { UserSeed } from './users/user.seed';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace disponible el .env en todo el proyecto
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') || '5433', 10),

        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        entities: [__dirname + '/**/*.entity{.ts,.js}'],

        synchronize: true, // Solo en desarrollo

        migrations: [__dirname + '/migration/*.js'],
        migrationsRun: true, // Opcional: corre migraciones al arrancar
        cli: {
          migrationsDir: 'src/migration',
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RolesModule,
  ],
  providers: [RolesSeed, UserSeed],
})
export class AppModule {}
