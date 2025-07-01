// shelf.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ShelfService } from './self.service';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';

@Controller('shelves')
export class ShelfController {
  constructor(private readonly shelfService: ShelfService) {}

  @Get()
  find(@Query('search') search?: string) {
    return this.shelfService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shelfService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateShelfDto) {
    return this.shelfService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShelfDto) {
    return this.shelfService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shelfService.remove(id);
  }

  @Get('by-locality/:localityId')
  findByLocality(@Param('localityId') localityId: string) {
    return this.shelfService.findByLocality(localityId);
  }

  @Get('by-category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.shelfService.findByCategory(categoryId);
  }
}
