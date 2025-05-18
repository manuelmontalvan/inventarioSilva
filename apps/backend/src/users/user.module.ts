import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Role } from './roles/role.entity';
import { RolesService } from './roles/roles.service';


@Module({
 
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exportamos para que otros módulos puedan usar el servicio
})
export class UsersModule {}
