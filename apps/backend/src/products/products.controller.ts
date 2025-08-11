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
import { CloudinaryService } from '../cloudinary/cloudinary.service';


@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService
    ,private readonly cloudinaryService: CloudinaryService
  ) {}

 @Post()
  @Roles(RoleType.admin, RoleType.bodeguero)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
   let imageUrl: string | undefined = undefined;


    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploadResult.secure_url;
    }

  const dtoWithImage = imageUrl
  ? { ...createProductDto, image: imageUrl }
  : { ...createProductDto };


    return this.productsService.create(dtoWithImage, user);
  }


   @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }

    const uploadResult = await this.cloudinaryService.uploadImage(file);

    if (!uploadResult || !uploadResult.secure_url) {
      throw new BadRequestException('Error al subir la imagen');
    }

    return {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
    };
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
