// inventory.controller.ts
import { Controller, Get, Post, Body, Delete,BadRequestException, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryMovementsDto } from './dto/create-inventory-movement.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async create(@Body() dto: CreateInventoryMovementsDto) {
    const result = await this.inventoryService.create(dto);
    return {
      message: 'Movimientos creados exitosamente',
      ...result,
    };
  }
  @Delete('clear')
  async clearAllMovements(@Query('confirm') confirm: string) {
    if (confirm !== 'YES') {
      throw new BadRequestException('Debes confirmar con ?confirm=YES');
    }
    return this.inventoryService.clearAll();
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }
}
