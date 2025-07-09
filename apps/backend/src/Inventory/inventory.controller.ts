// inventory.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
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


  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }
  
}
