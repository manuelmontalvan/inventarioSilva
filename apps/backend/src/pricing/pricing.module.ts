// pricing.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller'; // <- Importa el controller
import { MarginConfig } from './entities/margin-config.entity';
import { Tax } from './entities/tax.entity';
import { Category } from '../products/entities/category.entity';
import { Product } from '../products/entities/product.entity';  

@Module({
  imports: [
    TypeOrmModule.forFeature([MarginConfig, Tax, Category, Product]), 
  ],
  providers: [PricingService],
  controllers: [PricingController], // <- Declara el controller aquí
  exports: [PricingService],
})
export class PricingModule {}
