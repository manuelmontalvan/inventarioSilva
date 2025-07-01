import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Locality } from './entities/locality.entity';
import { Category } from '../entities/category.entity';
import { LocalityService } from './locality.service';
import { LocalityController } from './locality.controller';
import { Shelf } from './shelves/entities/shelf.entity';
import { ProductStock } from '../product-stock/product-stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Locality,Shelf, Category,ProductStock])],
  providers: [LocalityService],
  controllers: [LocalityController],
})
export class LocalityModule {}
