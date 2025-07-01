import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shelf } from './entities/shelf.entity';
import { Locality } from '../entities/locality.entity';
import { Category } from '../../entities/category.entity';
import { ShelfService } from './self.service';
import { ShelfController } from './shelf.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Shelf, Locality, Category])],
  controllers: [ShelfController],
  providers: [ShelfService],
})
export class ShelfModule {}
