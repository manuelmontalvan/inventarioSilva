import { Controller, Post, Get, Param, Body, Patch, Delete, ParseUUIDPipe,Query } from '@nestjs/common';
import { LocalityService } from './locality.service';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';

@Controller('localities')
export class LocalityController {
  constructor(private readonly localityService: LocalityService) {}

  @Post()
  create(@Body() dto: CreateLocalityDto) {
    return this.localityService.create(dto);
  }

  @Get()
  findAll() {
    return this.localityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.localityService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLocalityDto) {
    return this.localityService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.localityService.remove(id);
  }
  @Get('search')
search(@Query('term') term: string) {
  return this.localityService.search(term);
}

}
