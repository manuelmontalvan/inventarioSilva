// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorator/roles.decorator';
import { RoleType } from '../common/enum/roles.enum'; // <-- ¡Este es el import correcto!
import { Request } from 'express'; // Para el tipado de req
import { User } from '../users/user.entity'; // Asegúrate de la ruta correcta para tu entidad User
import {
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  // Usa RoleType.admin, RoleType.bodeguero para INVENTORY_MANAGER
  @Roles(RoleType.admin, RoleType.bodeguero)
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  // Usa RoleType.admin, RoleType.bodeguero, RoleType.vendedor
  @Roles(RoleType.admin, RoleType.bodeguero, RoleType.vendedor)
  async findAll(@Query('search') search?: string) {
    return this.productsService.findAll(search);
  }

  @Get(':id/cost-history')
  getProductCostHistory(@Param('id') id: string) {
    return this.productsService.getCostHistory(id);
  }
  @Get(':productId/cost-history')
  getHistory(@Param('productId') productId: string) {
    return this.productsService.getCostHistory(productId);
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
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  // Usa RoleType.admin
  @Roles(RoleType.admin)
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post('upload')
  @Roles(RoleType.admin)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${Date.now()}${ext}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.xlsx', '.csv'].includes(ext)) {
      throw new BadRequestException(
        'Invalid file type. Only .xlsx or .csv allowed',
      );
    }

    // Suponiendo que tu middleware de autenticación pone el usuario en req.user
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    return this.productsService.importProductsFromFile(file.path, ext, userId);
  }
}
