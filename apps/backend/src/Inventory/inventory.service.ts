import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement, MovementType } from './inventory-movement.entity';
import { CreateInventoryMovementsDto } from './dto/create-inventory-movement.dto';
import { Product } from '../products/entities/product.entity';
import { Locality } from '../products/locality/entities/locality.entity';
import { ProductStock } from '../products/product-stock/product-stock.entity';
import { DeepPartial } from 'typeorm';
import { PurchaseOrder } from '../productPurchase/entities/purchase-order.entity';
import { Sale } from '../productSales/entities/sale.entity';

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

    @InjectRepository(PurchaseOrder)
    private purchaseRepo: Repository<PurchaseOrder>,

    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
  ) {}
  async create(dto: CreateInventoryMovementsDto) {
    const results: InventoryMovement[] = [];

    for (const m of dto.movements) {
      const product = await this.productRepo.findOne({
        where: { id: m.productId },
        relations: ['brand', 'unit_of_measure'],
      });
      if (!product)
        throw new NotFoundException(`Producto ${m.productId} no encontrado`);

      if (!m.localityId) {
        throw new BadRequestException('Localidad es obligatoria');
      }
      const locality = await this.localityRepo.findOne({
        where: { id: m.localityId },
      });
      if (!locality) throw new NotFoundException('Localidad no encontrada');

      let stock = await this.productStockRepo.findOne({
        where: { product: { id: product.id }, locality: { id: locality.id } },
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

      if (dto.type === MovementType.OUT && stock.quantity < m.quantity) {
        throw new BadRequestException(
          `Stock insuficiente en localidad para producto ${product.name}`,
        );
      }

      // --- ACTUALIZAR ORDEN DE COMPRA O VENTA SEGÚN TIPO Y FACTURA ---

      if (dto.invoice_number) {
        if (
          dto.type === MovementType.IN &&
          dto.orderNumber &&
          dto.invoice_number
        ) {
          const purchaseOrder = await this.purchaseRepo.findOne({
            where: { orderNumber: dto.orderNumber },
          });

          if (purchaseOrder) {
            purchaseOrder.invoice_number = dto.invoice_number;
            await this.purchaseRepo.save(purchaseOrder);
          }
        }

        if (
          dto.type === MovementType.OUT &&
          dto.orderNumber &&
          dto.invoice_number
        ) {
          const saleOrder = await this.saleRepo.findOne({
            where: { orderNumber: dto.orderNumber },
          });

          if (saleOrder) {
            saleOrder.invoice_number = dto.invoice_number;
            await this.saleRepo.save(saleOrder);
          }
        }
      }

      // Crear movimiento sin purchase ni sale porque no quieres guardar esas relaciones
      const movement = this.movementRepo.create({
        type: dto.type,
        quantity: m.quantity,
        notes: dto.notes,
        product,
        locality,
        invoice_number: dto.invoice_number,
        orderNumber: dto.orderNumber,
        productName: product.name,
        brandName: product.brand?.name ?? undefined,
        unitName: product.unit_of_measure?.name ?? undefined,
      });

      // Actualizar stock según tipo
      if (dto.type === MovementType.IN) {
        stock.quantity += m.quantity;
      } else {
        stock.quantity -= m.quantity;
      }

      await this.productStockRepo.save(stock);

      // Actualizar cantidad total en producto
      const currentQty = parseFloat(product.current_quantity as any) || 0;
      product.current_quantity =
        dto.type === MovementType.IN
          ? currentQty + m.quantity
          : currentQty - m.quantity;
      await this.productRepo.save(product);

      // Guardar movimiento
      const savedMovement = await this.movementRepo.save(movement);
      results.push(savedMovement);
      if (dto.type === MovementType.OUT) {
        product.last_sale_date = savedMovement.createdAt;
        await this.productRepo.save(product);
      }
      if (dto.type === MovementType.IN) {
        product.last_purchase_date = savedMovement.createdAt;
        await this.productRepo.save(product);
      }
    }

    return results;
  }

  async findAll() {
    return this.movementRepo.find({
      relations: ['product', 'locality'],
      order: { createdAt: 'DESC' },
    });
  }
}
