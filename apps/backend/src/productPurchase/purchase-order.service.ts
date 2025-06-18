// src/purchases/purchase-order.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { Product } from '../products/entities/product.entity';
import { Supplier } from './supplier/supplier.entity';
import { User } from '../users/user.entity';
import { ProductPurchase } from './entities/product-purchase.entity';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';


@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly orderRepo: Repository<PurchaseOrder>,

    @InjectRepository(ProductPurchase)
    private readonly purchaseRepo: Repository<ProductPurchase>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreatePurchaseOrderDto, userId: string) {
  const supplier = await this.supplierRepo.findOne({ where: { id: dto.supplierId } });
  if (!supplier) throw new NotFoundException('Proveedor no encontrado');

  const registeredBy = await this.userRepo.findOne({ where: { id: Number(userId) } });
  if (!registeredBy) throw new NotFoundException('Usuario no encontrado');

  const purchaseOrder = new PurchaseOrder();
  purchaseOrder.supplier = supplier;
  purchaseOrder.registeredBy = registeredBy;
  purchaseOrder.invoice_number = dto.invoice_number;
  purchaseOrder.purchase_date = new Date(dto.purchase_date);
  purchaseOrder.notes = dto.notes;

  const items: ProductPurchase[] = [];

  for (const item of dto.items) {
    const product = await this.productRepo.findOne({ where: { id: item.productId } });
    if (!product) {
      throw new BadRequestException(`Producto no encontrado: ${item.productId}`);
    }

    const purchase = new ProductPurchase();
    purchase.product = product;
    purchase.supplier = supplier;
    purchase.invoice_number = item.invoice_number;
    purchase.quantity = item.quantity;
    purchase.unit_cost = item.unit_cost;
    purchase.total_cost = item.total_cost;
    purchase.purchase_date = new Date(dto.purchase_date);
    purchase.notes = item.notes;
    purchase.registeredBy = registeredBy;
    purchase.order = purchaseOrder;

    items.push(purchase);
  }

  purchaseOrder.purchase_lines = items;

  return await this.orderRepo.save(purchaseOrder);
}

  async findAll() {
    return this.orderRepo.find({
      relations: ['supplier', 'registeredBy', 'purchase_lines', 'purchase_lines.product'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['supplier', 'registeredBy', 'purchase_lines', 'purchase_lines.product'],
    });
    if (!order) throw new NotFoundException('Orden de compra no encontrada');
    return order;
  }
async update(id: string, dto: UpdatePurchaseOrderDto, userId: string) {
  const order = await this.orderRepo.findOne({
    where: { id },
    relations: ['registeredBy'],
  });

  if (!order) {
    throw new NotFoundException(`Orden con ID ${id} no encontrada`);
  }

  const user = await this.userRepo.findOne({ where: { id: Number(userId) } });
  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  if (dto.invoice_number !== undefined) order.invoice_number = dto.invoice_number;
  if (dto.purchase_date !== undefined) order.purchase_date = new Date(dto.purchase_date); // 🔥 Aquí se convierte
  if (dto.notes !== undefined) order.notes = dto.notes;

  order.registeredBy = user;

  return this.orderRepo.save(order);
}

  async remove(id: string) {
    const found = await this.orderRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Orden de compra no encontrada');
    await this.orderRepo.delete(id);
    return { message: 'Orden eliminada correctamente' };
  }
}
