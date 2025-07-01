import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Crear rol con páginas
  @Post()
  create(@Body() body: { name: string; pageIds?: string[] }) {
    const { name, pageIds = [] } = body;
    return this.rolesService.createRole(name, pageIds);
  }

  // Listar roles paginados
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.rolesService.findAllPaginated(pageNumber, limitNumber);
  }

  // Obtener rol por id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  // Actualizar rol con páginas
  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name: string; pageIds?: string[] }) {
    const { name, pageIds = [] } = body;
    return this.rolesService.updateRole(id, name, pageIds);
  }

  // Eliminar rol
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
}
