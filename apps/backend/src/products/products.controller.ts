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
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorator/roles.decorator';
import { RoleType } from '../common/enum/roles.enum';
import { Request } from 'express';
import { User } from '../users/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(RoleType.admin, RoleType.bodeguero)
  async create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    const user = req.user as User;
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @Roles(RoleType.admin, RoleType.bodeguero, RoleType.vendedor)
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryIds') categoryIds?: string | string[],
    @Query('search') search?: string,
  ) {
    let categoriesArray: string[] | undefined;
    if (typeof categoryIds === 'string') {
      categoriesArray = categoryIds.split(',');
    } else {
      categoriesArray = categoryIds;
    }

    return this.productsService.findAllPaginated(+page, +limit, categoriesArray, search);
  }

  @Get(':id')
  @Roles(RoleType.admin, RoleType.bodeguero, RoleType.vendedor)
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/cost-history')
  getProductCostHistory(@Param('id') id: string) {
    return this.productsService.getCostHistory(id);
  }

  @Patch(':id')
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
  @Roles(RoleType.admin)
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Delete()
  removeAll(): Promise<void> {
    return this.productsService.removeAll();
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
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.xlsx', '.csv'].includes(ext)) {
      throw new BadRequestException('Invalid file type. Only .xlsx or .csv allowed');
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    return this.productsService.importProductsFromFile(file.path, ext, userId);
  }
}
