import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPurchase } from './entities/product-purchase.entity';
import { PurchaseOrder } from './entities/purchase-order.entity'; // Asegúrate de importar esta entidad también
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { Product } from '../products/entities/product.entity';
import { Supplier } from './supplier/supplier.entity';
import { User } from '../users/user.entity';
import { ProductCostHistory } from './entities/product-cost-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductPurchase,
      PurchaseOrder,
      Product,
      Supplier,
      User,
      ProductCostHistory,
    ]),
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
