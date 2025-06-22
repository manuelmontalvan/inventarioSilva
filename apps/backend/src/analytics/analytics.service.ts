// src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCostHistory } from '../productPurchase/entities/product-cost-history.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ProductCostHistory)
    private readonly costHistoryRepo: Repository<ProductCostHistory>
  ) {}

  async getProductCostTrends(
    productIds: string[],
    startDate?: string,
    endDate?: string
  ) {
    const query = this.costHistoryRepo
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.product', 'product')
      .orderBy('history.date', 'ASC');

    if (productIds.length > 0) {
      query.andWhere('product.id IN (:...productIds)', { productIds });
    }

    if (startDate) {
      query.andWhere('history.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('history.date <= :endDate', { endDate });
    }

    const histories = await query.getMany();

    const groupedByProduct: Record<
      string,
      { name: string; data: { date: string; cost: number }[] }
    > = {};

    histories.forEach((record) => {
      const productName = record.product.name;
      if (!groupedByProduct[productName]) {
        groupedByProduct[productName] = {
          name: productName,
          data: [],
        };
      }
      groupedByProduct[productName].data.push({
        date: record.date.toISOString().split('T')[0],
        cost: Number(record.cost),
      });
    });

    return Object.values(groupedByProduct);
  }
}
