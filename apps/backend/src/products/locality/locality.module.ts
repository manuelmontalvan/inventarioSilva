import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Locality } from './locality.entity';
import { Category } from '../entities/category.entity';
import { LocalityService } from './locality.service';
import { LocalityController } from './locality.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Locality, Category])],
  providers: [LocalityService],
  controllers: [LocalityController],
})
export class LocalityModule {}
