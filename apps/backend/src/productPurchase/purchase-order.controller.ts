import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  Req,
  Query,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@UseGuards(JwtAuthGuard)
@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly service: PurchaseOrderService) {}

  @Post()
  async create(@Body() dto: CreatePurchaseOrderDto, @Request() req: any) {
    const user = req.user;
    return this.service.create(dto, user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      /* config */
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) throw new BadRequestException('No file uploaded');

    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.xlsx', '.csv'].includes(ext)) {
      throw new BadRequestException('Formato inválido. Solo XLSX o CSV.');
    }

    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Usuario no encontrado');

    return this.service.importPurchaseOrderFromFile(file.path, ext, userId);
  }

  @Get('history')
  getPurchaseHistory(
    @Query('productId') productId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (productId && !isUUID(productId)) {
      throw new BadRequestException('productId debe ser un UUID válido');
    }

    return this.service.getPurchaseHistory(productId, startDate, endDate);
  }
  @Get('price-trend/:productId')
  getPurchasePriceTrend(
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    return this.service.getPurchasePriceTrend(productId);
  }

  @Get('purchased-products')
  getPurchasedProducts() {
    return this.service.getPurchasedProducts();
  }
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id); // el service ya lanza NotFoundException si no se encuentra
  }
}
