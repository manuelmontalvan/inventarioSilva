// src/products/products.controller.ts
import { Controller, Get, Post, Body, Query,Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorator/roles.decorator';
import { RoleType } from '../common/enum/roles.enum'; // <-- ¡Este es el import correcto!
import { Request } from 'express'; // Para el tipado de req
import { User } from '../users/user.entity'; // Asegúrate de la ruta correcta para tu entidad User


@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}



  @Post()
  // Usa RoleType.admin, RoleType.bodeguero para INVENTORY_MANAGER
  @Roles(RoleType.admin, RoleType.bodeguero)
  async create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    
    const user = req.user as User;
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  // Usa RoleType.admin, RoleType.bodeguero, RoleType.vendedor
  @Roles(RoleType.admin, RoleType.bodeguero, RoleType.vendedor)
  async findAll(@Query('search') search?: string) {
  return this.productsService.findAll(search);
}

  @Get(':id')
  // Usa RoleType.admin, RoleType.bodeguero, RoleType.vendedor
  @Roles(RoleType.admin, RoleType.bodeguero, RoleType.vendedor)
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  // Usa RoleType.admin, RoleType.bodeguero
  @Roles(RoleType.admin, RoleType.bodeguero)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: Request) {
    const user = req.user as User;
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  // Usa RoleType.admin
  @Roles(RoleType.admin)
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }



}