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
  Req
} from '@nestjs/common';
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

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id); // el service ya lanza NotFoundException si no se encuentra
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

    return this.service.importPurchaseOrderFromFile(
      file.path,
      ext,
      userId,
    );
  }
}
