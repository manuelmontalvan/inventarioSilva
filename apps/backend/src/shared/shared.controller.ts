import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SharedService } from './shared.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('shared')
export class SharedController {
  constructor(private readonly sharedService: SharedService) {}
  @UseGuards(JwtAuthGuard)
  @Get('by-number/:orderNumber')
  async getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.sharedService.getOrderDetailsByOrderNumber(orderNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get('monthly-sales-purchases')
  async getMonthlySalesAndPurchases(
    @Query('startMonth') startMonth?: string,
    @Query('endMonth') endMonth?: string,
  ) {
    return await this.sharedService.getMonthlySalesAndPurchases(
      startMonth,
      endMonth,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('total-products')
  async getTotalProducts() {
    return await this.sharedService.getTotalProducts();
  }
  // SharedController
@Get('available-months')
async getAvailableMonths() {
  return this.sharedService.getAvailableMonths();
}

}
