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
  Delete
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateSaleDto, @Req() req: Request) {
    const user = req.user as any;
    return this.salesService.create(dto, user);
  }
  @Get('search')
  async searchProducts(@Query('query') query: string) {
    return this.salesService.searchProducts(query);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const sale = await this.salesService.findOne(id);
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    return sale;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.salesService.findAll();
  }

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


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.salesService.removeAll();
  }
}
