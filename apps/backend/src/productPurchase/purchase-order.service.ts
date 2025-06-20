// src/purchases/purchase-order.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, DataSource } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { Product } from '../products/entities/product.entity';
import { Supplier } from './supplier/supplier.entity';
import { User } from '../users/user.entity';
import { ProductPurchase } from './entities/product-purchase.entity';
import { ProductCostHistory } from './entities/product-cost-history.entity';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly orderRepo: Repository<PurchaseOrder>,

    @InjectRepository(ProductPurchase)
    private readonly purchaseRepo: Repository<ProductPurchase>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductCostHistory)
    private readonly productCostHistoryRepo: Repository<ProductCostHistory>,

    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePurchaseOrderDto, user: User) {
    console.log('===> Iniciando creación de orden de compra');

    const supplier = await this.supplierRepo.findOneBy({ id: dto.supplierId });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    console.log('Proveedor encontrado:', supplier.name);

    const registeredBy = { id: user.id } as User;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateString = `${yyyy}${mm}${dd}`;

    const countToday = await this.orderRepo.count({
      where: {
        purchase_date: Between(
          new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`),
          new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`),
        ),
      },
    });

    const correlativo = String(countToday + 1).padStart(4, '0');
    const orderNumber = `OC-${dateString}-${correlativo}`;
    console.log('Correlativo generado:', orderNumber);

    return await this.dataSource.transaction(async (manager) => {
      const purchaseOrder = manager.create(PurchaseOrder, {
        supplier,
        registeredBy,
        invoice_number: dto.invoice_number,
        purchase_date: new Date(dto.purchase_date),
        notes: dto.notes,
        orderNumber,
      });

      const savedOrder = await manager.save(purchaseOrder);
      const purchaseLines: ProductPurchase[] = [];

      for (const item of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
        });
        if (!product) {
          throw new BadRequestException(
            `Producto no encontrado: ${item.productId}`,
          );
        }

        //console.log('Procesando producto:', product.id);

        // ✅ Actualizar precio y fecha de última compra
        product.purchase_price = item.unit_cost;
        product.last_purchase_date = new Date(dto.purchase_date);
        /*console.log('✅ Producto antes de guardar:', {
        id: product.id,
        purchase_price: product.purchase_price,
        last_purchase_date: product.last_purchase_date,
      });*/
        await manager.save(product);
        //console.log('✅ Producto actualizado');

        // ✅ Guardar historial de costos si el precio cambió
        const lastHistory = await manager.findOne(ProductCostHistory, {
          where: { product: { id: product.id } },
          order: { date: 'DESC' },
        });

        if (!lastHistory || +lastHistory.cost !== +item.unit_cost) {
          const costHistory = manager.create(ProductCostHistory, {
            product,
            cost: item.unit_cost,
            date: new Date(dto.purchase_date),
            purchaseOrder: savedOrder,
          });
          await manager.save(costHistory);
          //console.log('✅ Historial de costo guardado');
        }

        // ✅ Crear línea de compra
        const purchaseLine = manager.create(ProductPurchase, {
          product,
          supplier,
          invoice_number: item.invoice_number,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
          purchase_date: new Date(dto.purchase_date),
          notes: item.notes,
          registeredBy,
          order: savedOrder,
        });

        const savedLine = await manager.save(purchaseLine);
        purchaseLines.push(savedLine);
        //console.log('✅ Línea de compra guardada');
      }

      savedOrder.purchase_lines = purchaseLines;

      // ✅ Devolver orden con relaciones
      const fullOrder = await manager.findOne(PurchaseOrder, {
        where: { id: savedOrder.id },
        relations: [
          'supplier',
          'registeredBy',
          'purchase_lines',
          'purchase_lines.product',
        ],
      });

      //console.log('✅ Orden de compra completada');
      return fullOrder;
    });
  }

  async findAll() {
    return this.orderRepo.find({
      relations: [
        'supplier',
        'registeredBy',
        'purchase_lines',
        'purchase_lines.product',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: [
        'supplier',
        'registeredBy',
        'purchase_lines',
        'purchase_lines.product',
      ],
    });
    if (!order) throw new NotFoundException('Orden de compra no encontrada');
    return order;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto, userId: string) {
    const userIdNumber = Number(userId);
    if (isNaN(userIdNumber)) throw new BadRequestException('Invalid userId');

    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['registeredBy'],
    });
    if (!order) throw new NotFoundException(`Orden con ID ${id} no encontrada`);

    const user = await this.userRepo.findOneBy({ id: userIdNumber });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.invoice_number !== undefined)
      order.invoice_number = dto.invoice_number;
    if (dto.purchase_date !== undefined)
      order.purchase_date = new Date(dto.purchase_date);
    if (dto.notes !== undefined) order.notes = dto.notes;

    order.registeredBy = user;

    return this.orderRepo.save(order);
  }

  async remove(id: string) {
    const found = await this.orderRepo.findOneBy({ id });
    if (!found) throw new NotFoundException('Orden de compra no encontrada');

    await this.orderRepo.delete(id);
    return { message: 'Orden eliminada correctamente' };
  }
}
