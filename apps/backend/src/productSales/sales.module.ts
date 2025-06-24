import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { ProductSale } from './entities/product-sale.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Product } from '../products/entities/product.entity';
import { Customer } from './customers/customer.entity';
import { User } from '../users/user.entity';
import { OrderNumberCounter } from './entities/order-number-counter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, ProductSale, Product, Customer, User, OrderNumberCounter ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}