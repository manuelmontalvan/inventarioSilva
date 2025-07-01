// src/products/product-stock.module.ts
import { Module } from '@nestjs/common';
import { ProductStockService } from './product-stock.service';
import { ProductStockController } from './product-stock.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductStock } from './product-stock.entity';
import { Product } from '../entities/product.entity';
import { Locality } from '../locality/entities/locality.entity';
import { Shelf } from '../locality/shelves/entities/shelf.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductStock, Product, Locality,ProductStock, Shelf ])],
  controllers: [ProductStockController],
  providers: [ProductStockService],
})
export class ProductStockModule {}
