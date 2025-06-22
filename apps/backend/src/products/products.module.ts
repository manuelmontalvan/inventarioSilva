import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { UnitOfMeasure } from './entities/unit-of-measure.entity';
import { Locality } from './locality/locality.entity';
import {ProductCostHistory} from '../productPurchase/entities/product-cost-history.entity'
import { InventoryMovement } from 'src/Inventory/inventory-movement.entity';
import { ProductStock } from './product-stock/product-stock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Brand,
      UnitOfMeasure,
      Locality, 
      ProductCostHistory, 
      ProductStock,
      InventoryMovement
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
