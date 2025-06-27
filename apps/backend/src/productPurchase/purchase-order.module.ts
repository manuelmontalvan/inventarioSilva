import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ProductPurchase } from './entities/product-purchase.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { Product } from '../products/entities/product.entity';
import { Supplier } from './supplier/supplier.entity';
import { User } from '../users/user.entity';
import { ProductCostHistory } from './entities/product-cost-history.entity';
import { UnitOfMeasure } from 'src/products/entities/unit-of-measure.entity';
import { Brand } from 'src/products/entities/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductPurchase,
      PurchaseOrder,
      Product,
      Supplier,
      User,
      ProductCostHistory,
      UnitOfMeasure,
      Brand,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // asegúrate de que exista esta carpeta
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExt = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExt}`);
        },
      }),
    }),
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
