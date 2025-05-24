import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { RolesModule } from './users/roles/roles.module';
import { RolesSeed } from './users/roles/roles.seed';
import { UserSeed } from './users/user.seed';

import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './products/categories/categories.module';
import { BrandsModule } from './products/brands/brands.module';
import { UnitsModule } from './products/unitsOfMeasure/units.module'; // Unidades de medida

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
        migrationsRun: true,
        cli: {
          migrationsDir: 'src/migration',
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    UnitsModule,
  ],
  providers: [RolesSeed, UserSeed],
})
export class AppModule {}
