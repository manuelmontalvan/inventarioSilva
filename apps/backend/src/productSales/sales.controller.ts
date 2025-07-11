import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Delete,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // Crear venta
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateSaleDto, @Req() req: Request) {
    const user = req.user as any;
    return this.salesService.create(dto, user);
  }

  // Buscar productos por nombre
  @Get('search')
  async searchProducts(@Query('query') query: string) {
    return this.salesService.searchProducts(query);
  }

  // Obtener una venta por ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const sale = await this.salesService.findOne(id);
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    return sale;
  }

  // Obtener todas las ventas
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.salesService.findAll();
  }

  // Importar ventas desde Excel
  @UseGuards(JwtAuthGuard)
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('No se recibió archivo válido');
    }

    const user = req.user as any;

    try {
      const sale = await this.salesService.importSalesFromExcel(
        file.buffer,
        user,
      );
      return {
        message: 'Ventas importadas exitosamente',
        sale,
      };
    } catch (error) {
      throw error;
    }
  }

  // Eliminar una venta
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }

  // Eliminar todas las ventas
  @UseGuards(JwtAuthGuard)
  @Delete()
  removeAll() {
    return this.salesService.removeAll();
  }

  // NUEVO: Obtener historial de ventas por producto y fechas
  @UseGuards(JwtAuthGuard)
  @Get('history/by-product')
  async getSalesHistory(
    @Query('productId') productId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.salesService.getSalesHistory(productId, startDate, endDate);
  }

  // NUEVO: Obtener tendencia de precios de venta
  @UseGuards(JwtAuthGuard)
  @Get('trend/:productId')
  async getSalePriceTrend(@Param('productId') productId: string) {
    return this.salesService.getSalePriceTrend(productId);
  }

  // NUEVO: Obtener productos vendidos únicos
  @UseGuards(JwtAuthGuard)
  @Get('products')
  async getSoldProducts() {
    return this.salesService.getSoldProducts();
  }
}
