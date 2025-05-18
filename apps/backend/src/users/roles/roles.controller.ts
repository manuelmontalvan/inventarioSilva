import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body('name') name: string) {
    return this.rolesService.createRole(name);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findById(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.rolesService.updateRole(+id, name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.deleteRole(+id);
  }
}
