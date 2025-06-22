import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryMovement } from './inventory-movement.entity';
import { Product } from '../products/entities/product.entity'; // Ajusta la ruta si es necesario
import { Locality } from '../products/locality/locality.entity';
import { ProductStock } from 'src/products/product-stock/product-stock.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryMovement, Product,Locality , ProductStock ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
