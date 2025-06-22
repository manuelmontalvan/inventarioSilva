import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreateMarginConfigDto } from './dto/create-margin-config.dto';
import { UpdateMarginConfigDto } from './dto/update-margin-config.dto';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly service: PricingService) {}

  // === Margins ===

  @Post('margins')
  createMargin(@Body() dto: CreateMarginConfigDto) {
    return this.service.createMargin(dto);
  }

  @Patch('margins/:id')
  updateMargin(@Param('id') id: string, @Body() dto: UpdateMarginConfigDto) {
    return this.service.updateMargin(id, dto);
  }

  @Get('margins')
  getAllMargins() {
    return this.service.getAllMargins();
  }

  @Delete('margins/:id')
  deleteMargin(@Param('id') id: string) {
    return this.service.deleteMargin(id);
  }

  // === Taxes ===

  @Post('taxes')
  createTax(@Body() dto: CreateTaxDto) {
    return this.service.createTax(dto);
  }

  @Patch('taxes/:id')
  updateTax(@Param('id') id: string, @Body() dto: UpdateTaxDto) {
    return this.service.updateTax(id, dto);
  }

  @Get('taxes')
  getAllTaxes() {
    return this.service.getAllTaxes();
  }

  @Delete('taxes/:id')
  deleteTax(@Param('id') id: string) {
    return this.service.deleteTax(id);
  }
}