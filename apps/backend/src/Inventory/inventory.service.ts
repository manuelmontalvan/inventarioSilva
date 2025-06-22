import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement, MovementType } from './inventory-movement.entity';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { Product } from '../products/entities/product.entity';
import { Locality } from '../products/locality/locality.entity';
import { ProductStock } from '../products/product-stock/product-stock.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryMovement)
    private movementRepo: Repository<InventoryMovement>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(Locality)
    private localityRepo: Repository<Locality>,

    @InjectRepository(ProductStock)
    private productStockRepo: Repository<ProductStock>,
  ) {}

  async create(dto: CreateInventoryMovementDto) {
    // Buscar producto
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Buscar localidad (requerida)
    if (!dto.localityId) {
      throw new BadRequestException('Localidad es obligatoria');
    }
    const locality = await this.localityRepo.findOne({ where: { id: dto.localityId } });
    if (!locality) throw new NotFoundException('Localidad no encontrada');

    // Buscar o crear registro ProductStock para producto+localidad
    let stock = await this.productStockRepo.findOne({
      where: {
        product: { id: product.id },
        locality: { id: locality.id },
      },
      relations: ['product', 'locality'],
    });

    if (!stock) {
      stock = this.productStockRepo.create({
        product,
        locality,
        quantity: 0,
        min_stock: 0,
        max_stock: 0,
      });
    }

    // Validar stock suficiente en ProductStock para salida
    if (dto.type === MovementType.OUT && stock.quantity < dto.quantity) {
      throw new BadRequestException('Stock insuficiente en localidad');
    }

    // Crear movimiento de inventario
    const movement = this.movementRepo.create({
      type: dto.type,
      quantity: dto.quantity,
      notes: dto.notes,
      product,
      locality,
      invoice_number: dto.invoice_number,
      orderNumber: dto.orderNumber,
    });

    // Actualizar cantidad en ProductStock
    if (dto.type === MovementType.IN) {
      stock.quantity += dto.quantity;
    } else {
      stock.quantity -= dto.quantity;
    }

    // Guardar stock actualizado
    await this.productStockRepo.save(stock);

    // (Opcional) Actualizar cantidad total en producto
    // Puedes hacer un cálculo sumando todos los stocks para actualizar product.current_quantity
    // O mantenerlo manualmente como antes (aquí solo sumamos o restamos)
    const currentQty = parseFloat(product.current_quantity as any) || 0;
    product.current_quantity = dto.type === MovementType.IN ? currentQty + dto.quantity : currentQty - dto.quantity;
    await this.productRepo.save(product);

    // Guardar movimiento
    return this.movementRepo.save(movement);
  }

  async findAll() {
    return this.movementRepo.find({
      relations: ['product', 'locality'],
      order: { createdAt: 'DESC' },
    });
  }
}
