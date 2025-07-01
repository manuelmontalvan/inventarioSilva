import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { PagesService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagesService.delete(id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }
}
