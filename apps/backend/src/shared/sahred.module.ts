import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedService } from './shared.service';
import { SharedController } from './shared.controller';

import { PurchaseOrder } from '../productPurchase/entities/purchase-order.entity';
import { Sale } from '../productSales/entities/sale.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, Sale,Product])],
  providers: [SharedService],
  controllers: [SharedController],
})
export class SharedModule {}
