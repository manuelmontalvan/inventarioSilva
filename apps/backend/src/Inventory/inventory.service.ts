// src/inventory/inventory.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement, MovementType } from './inventory-movement.entity';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryMovement)
    private movementRepo: Repository<InventoryMovement>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateInventoryMovementDto) {
    // Buscar producto
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Convertir current_quantity a número
    const currentQty = parseFloat(product.current_quantity as unknown as string) || 0;

    // Validar stock suficiente para salida
    if (dto.type === MovementType.OUT && currentQty < dto.quantity) {
      throw new BadRequestException('Stock insuficiente');
    }

    // Crear movimiento de inventario
    const movement = this.movementRepo.create({
      type: dto.type,
      quantity: dto.quantity,
      notes: dto.notes,
      product,
    });

    // Actualizar stock según tipo de movimiento
    let newQty = currentQty;
    if (dto.type === MovementType.IN) {
      newQty = currentQty + dto.quantity;
    } else {
      newQty = currentQty - dto.quantity;
    }

    product.current_quantity = newQty;

    // Guardar cambios
    await this.productRepo.save(product);
    return this.movementRepo.save(movement);
  }

  async findAll() {
    return this.movementRepo.find({
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }
}
