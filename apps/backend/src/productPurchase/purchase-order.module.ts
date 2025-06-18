import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPurchase } from './product-purchase.entity';
import { ProductPurchaseService } from './purchase-order.service';
import { ProductPurchaseController } from './purchase-order.controller';
import { Product } from '../products/entities/product.entity';
import { Supplier } from './supplier/supplier.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPurchase, Product, Supplier, User])],
  controllers: [ProductPurchaseController],
  providers: [ProductPurchaseService],
})
export class ProductPurchaseModule {}
