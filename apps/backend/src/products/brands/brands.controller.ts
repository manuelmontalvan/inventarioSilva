import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from '../dtos/brand/create-brand.dto';
import { UpdateBrandDto } from '../dtos/brand/update-brand.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly service: BrandsService) {}

  @Post()
  create(@Body() dto: CreateBrandDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
