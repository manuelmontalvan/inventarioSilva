// src/analytics/analytics.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

 @Get('product-cost-history')
getProductCostTrends(
  @Query('productIds') productIds?: string,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string
) {
  const ids = productIds?.split(",") ?? [];
  return this.analyticsService.getProductCostTrends(ids, startDate, endDate);
}
}