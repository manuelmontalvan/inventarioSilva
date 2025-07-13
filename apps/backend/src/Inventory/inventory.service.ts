// src/inventory/inventory-movement.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement, MovementType } from './inventory-movement.entity';
import { Product } from '../products/entities/product.entity';
import { Locality } from '../products/locality/entities/locality.entity';
import { ProductStock } from '../products/product-stock/product-stock.entity';
import { Shelf } from '../products/locality/shelves/entities/shelf.entity';
import { CreateInventoryMovementsDto } from './dto/create-inventory-movement.dto';
import { ProductStockService } from '../products/product-stock/product-stock.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly movementRepo: Repository<InventoryMovement>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Locality)
    private readonly localityRepo: Repository<Locality>,

    @InjectRepository(Shelf)
    private readonly shelfRepo: Repository<Shelf>,

    @InjectRepository(ProductStock)
    private readonly stockRepo: Repository<ProductStock>,
     private readonly productStockService: ProductStockService,
  ) {}

  async create(
    dto: CreateInventoryMovementsDto,
  ): Promise<{ movements: InventoryMovement[]; warnings: string[] }> {
    const savedMovements: InventoryMovement[] = [];
    const warnings: string[] = [];
    const errorMessages: string[] = [];

    for (const item of dto.movements) {
      const { productId, localityId, shelfId, unitId, quantity } = item;

      const [product, locality, shelf] = await Promise.all([
        this.productRepo.findOne({
          where: { id: productId },
          relations: ['brand', 'unit_of_measure'],
        }),
        this.localityRepo.findOneBy({ id: localityId }),
        this.shelfRepo.findOneBy({ id: shelfId }),
      ]);

      if (!product || !locality || !shelf) {
        errorMessages.push(
          `Producto, localidad o percha no encontrados para el producto "${item.productName}".`,
        );
        continue;
      }

      let stock = await this.stockRepo.findOne({
        where: {
          product: { id: productId },
          shelf: { id: shelfId },
        },
      });

      if (dto.type === MovementType.IN) {
        const currentQuantity = stock?.quantity ?? 0;
        const maxStock = Number(stock?.max_stock ?? 0);
        const newQuantity = currentQuantity + quantity;

        if (maxStock && newQuantity > maxStock) {
          errorMessages.push(
            `El producto "${product.name}" en la percha "${shelf.name}" supera el stock máximo (${newQuantity} > ${maxStock}).`,
          );
          continue;
        }

        if (!stock) {
          stock = this.stockRepo.create({
            product,
            shelf,
            locality,
            shelfId,
            quantity,
            min_stock: 0,
            max_stock: 0,
          });
        } else {
          stock.quantity = newQuantity;
        }
      } else if (dto.type === MovementType.OUT) {
        if (!stock) {
          errorMessages.push(
            `No existe stock en la percha "${shelf.name}" para el producto "${product.name}".`,
          );
          continue;
        }

        if (stock.quantity < quantity) {
          errorMessages.push(
            `Stock insuficiente para "${product.name}" en la percha "${shelf.name}". Disponible: ${stock.quantity}`,
          );
          continue;
        }

        const newQuantity = stock.quantity - quantity;
        const minStock = Number(stock.min_stock ?? 0);

        if (minStock && newQuantity < minStock) {
          errorMessages.push(
            `El producto "${product.name}" en la percha "${shelf.name}" quedaría por debajo del mínimo (${newQuantity} < ${minStock}).`,
          );
          continue;
        }

        stock.quantity = newQuantity;
      }

      if (!stock) {
        errorMessages.push(
          `Error inesperado con el stock de "${product.name}".`,
        );
        continue;
      }

      await this.stockRepo.save(stock);
      await this.productStockService.updateProductTotalStock(product.id);
      const movement = this.movementRepo.create({
        type: dto.type,
        quantity,
        product,
        locality,
        localityId: locality.id,
        brandName: product.brand?.name ?? '',
        productName: product.name,
        unitName: product.unit_of_measure?.name ?? '',
        notes: dto.notes,
        invoice_number: dto.invoice_number,
        orderNumber: dto.orderNumber,
        shelfId: shelf.id,
        shelfName: shelf.name,
      });

      const saved = await this.movementRepo.save(movement);
      savedMovements.push(saved);
    }

    if (errorMessages.length > 0) {
      throw new BadRequestException({
        message:
          'Algunos productos no se pudieron registrar por errores de stock:',
        details: errorMessages,
      });
    }

    return { movements: savedMovements, warnings };
  }

  async findAll(): Promise<InventoryMovement[]> {
    return this.movementRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['product', 'locality'],
    });
  }
}
