// src/analytics/analytics.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('product-cost-history')
  getProductCostTrends(@Query('productId') productId?: string) {
    return this.analyticsService.getProductCostTrends(productId);
  }
}