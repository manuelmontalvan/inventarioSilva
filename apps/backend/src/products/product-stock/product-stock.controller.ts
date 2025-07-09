// src/products/product-stock.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
   Query 
} from '@nestjs/common';
import { ProductStockService } from './product-stock.service';
import { CreateProductStockDto } from './dto/create-product-stock.dto';
import { UpdateProductStockDto } from './dto/update-product-stock.dto';
import { ProductStock } from './product-stock.entity';

@Controller('product-stock')
export class ProductStockController {
  constructor(private readonly service: ProductStockService) {}

  @Post()
  create(@Body() dto: CreateProductStockDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.service.findAll(productId);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductStockDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
  @Get('search')
async search(
  @Query('q') query: string,
): Promise<ProductStock[]> {
  return this.service.searchStocks(query);
}

}
