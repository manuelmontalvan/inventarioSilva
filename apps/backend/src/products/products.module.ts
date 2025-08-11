import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { UnitOfMeasure } from './entities/unit-of-measure.entity';
import { Locality } from './locality/entities/locality.entity';
import {ProductCostHistory} from '../productPurchase/entities/product-cost-history.entity'
import { InventoryMovement } from 'src/Inventory/inventory-movement.entity';
import { ProductStock } from './product-stock/product-stock.entity';
import { Shelf } from './locality/shelves/entities/shelf.entity';
import { ProductStockService } from './product-stock/product-stock.service';
import { PricingService } from 'src/pricing/pricing.service';
import { MarginConfig } from '../pricing/entities/margin-config.entity';
import { Tax } from 'src/pricing/entities/tax.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

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
      InventoryMovement,
      Shelf,
      MarginConfig,
      Tax
    ]),
     CloudinaryModule,
  ],
  controllers: [ProductsController],

  providers: [ProductsService  ,ProductStockService, PricingService ],
})
export class ProductsModule {}
