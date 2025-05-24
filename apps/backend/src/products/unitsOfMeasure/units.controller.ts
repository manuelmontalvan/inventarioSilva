import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitOfMeasureDto } from '../dtos/unitOfMeasure/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDto } from '../dtos/unitOfMeasure/update-unit-of-measure.dto';

@Controller('units')
export class UnitsController {
  constructor(private readonly service: UnitsService) {}

  @Post()
  create(@Body() dto: CreateUnitOfMeasureDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateUnitOfMeasureDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
