import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryMovement } from './inventory-movement.entity';
import { Product } from '../products/entities/product.entity'; // Ajusta la ruta si es necesario
import { Locality } from '../products/locality/entities/locality.entity';
import { ProductStock } from 'src/products/product-stock/product-stock.entity';
import { ProductPurchase } from 'src/productPurchase/entities/product-purchase.entity';
import { Sale } from 'src/productSales/entities/sale.entity';
import {PurchaseOrder} from '../productPurchase/entities/purchase-order.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryMovement, Product,Locality , ProductStock,Sale,PurchaseOrder  ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService,ProductPurchase],
  exports: [InventoryService],
})
export class InventoryModule {}
