import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Page } from '../../page/entities/page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Page])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],  // Exportamos para que otros módulos puedan usar el servicio
})
export class RolesModule {}
