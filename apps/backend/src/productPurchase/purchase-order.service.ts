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
import { CreateProductPurchaseDto } from './dto/create-product-purchase.dto';

import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { Product } from '../products/entities/product.entity';
import { Brand } from '../products/entities/brand.entity';
import { UnitOfMeasure } from '../products/entities/unit-of-measure.entity';
import { Supplier } from './supplier/supplier.entity';
import { User } from '../users/user.entity';
import { ProductPurchase } from './entities/product-purchase.entity';
import { ProductCostHistory } from './entities/product-cost-history.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { groupBy } from 'lodash';
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
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,

    @InjectRepository(UnitOfMeasure)
    private readonly unitOfMeasureRepo: Repository<UnitOfMeasure>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePurchaseOrderDto, user: User) {
    console.log('===> Iniciando creación de orden de compra');

    const supplier = await this.supplierRepo.findOneBy({ id: dto.supplierId });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    console.log('Proveedor encontrado:', supplier.name);

    const registeredBy = { id: user.id } as User;

    // ✅ Fecha actual en UTC
    const now = new Date();

    // ✅ Rango del día actual en UTC
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');

    const todayStartUtc = new Date(
      Date.UTC(yyyy, now.getUTCMonth(), now.getUTCDate()),
    );
    const todayEndUtc = new Date(
      Date.UTC(yyyy, now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999),
    );

    const countToday = await this.orderRepo.count({
      where: {
        purchase_date: Between(todayStartUtc, todayEndUtc),
      },
    });

    const correlativo = String(countToday + 1).padStart(4, '0');
    const orderNumber = `OC-${yyyy}${mm}${dd}-${correlativo}`;
    console.log('Correlativo generado:', orderNumber);

    return await this.dataSource.transaction(async (manager) => {
      const purchaseOrder = manager.create(PurchaseOrder, {
        supplier,
        registeredBy,
        invoice_number: dto.invoice_number,
        purchase_date: now, // ya en UTC
        notes: dto.notes,
        orderNumber,
      });

      const savedOrder = await manager.save(purchaseOrder);
      const purchaseLines: ProductPurchase[] = [];

      for (const item of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
          relations: ['brand', 'unit_of_measure'],
        });
        if (!product) {
          throw new BadRequestException(
            `Producto no encontrado: ${item.productId}`,
          );
        }

        product.purchase_price = item.unit_cost;
        product.last_purchase_date = now;
        // ✅ Recalcular sale_price si ya tiene margen de ganancia definido
        if (
          typeof product.profit_margin === 'number' &&
          product.profit_margin > 0
        ) {
          product.sale_price = parseFloat(
            (
              product.purchase_price /
              (1 - product.profit_margin / 100)
            ).toFixed(2),
          );
          console.log(
            `📦 Producto "${product.name}" actualizado con nuevo precio de venta: ${product.sale_price}`,
          );
        }

        await manager.save(product);

        const lastHistory = await manager.findOne(ProductCostHistory, {
          where: { product: { id: product.id } },
          order: { date: 'DESC' },
        });

        if (!lastHistory || +lastHistory.cost !== +item.unit_cost) {
          const costHistory = manager.create(ProductCostHistory, {
            product,
            cost: item.unit_cost,
            date: now,
            purchaseOrder: savedOrder,
          });
          await manager.save(costHistory);
        }

        const purchaseLine = manager.create(ProductPurchase, {
          product,
          product_name: product.name,
          brand: product.brand,
          unit_of_measure: product.unit_of_measure,
          supplier,
          invoice_number: item.invoice_number,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
          purchase_date: now,
          notes: item.notes,
          registeredBy,
          order: savedOrder,
        });

        const savedLine = await manager.save(purchaseLine);
        purchaseLines.push(savedLine);
      }

      savedOrder.purchase_lines = purchaseLines;

      const fullOrder = await manager.findOne(PurchaseOrder, {
        where: { id: savedOrder.id },
        relations: [
          'supplier',
          'registeredBy',
          'purchase_lines',
          'purchase_lines.product',
        ],
      });

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
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['registeredBy'],
    });
    if (!order) throw new NotFoundException(`Orden con ID ${id} no encontrada`);

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.invoice_number !== undefined)
      order.invoice_number = dto.invoice_number;

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

  async importPurchaseOrderFromFile(
    filePath: string,
    ext: string,
    userId: string,
  ) {
    const content = fs.readFileSync(filePath);

    // Parsear filas según extensión
    const rows =
      ext === '.csv'
        ? parse(content, {
            columns: true,
            skip_empty_lines: true,
            delimiter: ',',
          })
        : XLSX.utils.sheet_to_json(
            XLSX.read(content, { type: 'buffer' }).Sheets['Sheet1'],
          );
    const supplierNames = new Set(rows.map((row) => row['supplierName']));

    if (supplierNames.size > 1) {
      throw new BadRequestException(
        'El archivo contiene múltiples proveedores. Solo se permite un proveedor por orden de compra.',
      );
    }

    // Buscar o crear usuario
    let user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      user = this.userRepo.create({
        id: userId,
        name: 'Usuario Importado',
      });
      user = await this.userRepo.save(user);
    }

    const createDto = new CreatePurchaseOrderDto();
    createDto.supplierId = '';
    createDto.invoice_number = '';
    createDto.notes = '';

    const items: CreateProductPurchaseDto[] = [];

    for (const row of rows) {
      // Proveedor
      let supplier = await this.supplierRepo.findOne({
        where: { name: row['supplierName'] },
      });
      if (!supplier) {
        supplier = this.supplierRepo.create({ name: row['supplierName'] });
        supplier = await this.supplierRepo.save(supplier);
      }
      if (!createDto.supplierId) createDto.supplierId = supplier.id;

      if (!createDto.invoice_number && row['invoice_number']) {
        createDto.invoice_number = row['invoice_number'];
      }

      // Producto
      let product = await this.productRepo.findOne({
        where: { name: row['productName'] },
        relations: ['brand', 'unit_of_measure'],
      });
      if (!product) {
        product = this.productRepo.create({ name: row['productName'] });
        product = await this.productRepo.save(product);
      }

      // Marca
      let brand: Brand | null = null;

      if (row['brandName']) {
        brand = await this.brandRepo.findOne({
          where: { name: row['brandName'] },
        });
        if (!brand) {
          brand = this.brandRepo.create({ name: row['brandName'] });
          brand = await this.brandRepo.save(brand);
        }
      }

      // Unidad de medida
      let unitOfMeasure: UnitOfMeasure | null = null;
      if (row['unitOfMeasureName']) {
        unitOfMeasure = await this.unitOfMeasureRepo.findOne({
          where: { name: row['unitOfMeasureName'] },
        });
        if (!unitOfMeasure) {
          unitOfMeasure = this.unitOfMeasureRepo.create({
            name: row['unitOfMeasureName'],
          });
          unitOfMeasure = await this.unitOfMeasureRepo.save(unitOfMeasure);
        }
      }

      // Actualizar producto con marca y unidad si no están
      let updateNeeded = false;
      if (brand && !product.brand) {
        product.brand = brand;
        updateNeeded = true;
      }
      if (unitOfMeasure && !product.unit_of_measure) {
        product.unit_of_measure = unitOfMeasure;
        updateNeeded = true;
      }
      if (updateNeeded) {
        await this.productRepo.save(product);
      }
      items.push({
        productId: product.id,
        supplierId: supplier.id,
        invoice_number: row['invoice_number'],
        quantity: Number(row['quantity']),
        unit_cost: Number(row['unit_cost']),
        total_cost: Number(row['total_cost']),
        notes: row['notes'] || null,
        brandId: product.brand ? product.brand.id : undefined,
        unitOfMeasureId: product.unit_of_measure
          ? product.unit_of_measure.id
          : undefined, // undefined en vez de null
      });
    }

    createDto.items = items;

    const createdOrder = await this.create(createDto, user);

    fs.unlinkSync(filePath);

    return {
      message: 'Orden de compra importada con éxito',
      order: createdOrder,
    };
  }

  async getPurchaseHistory(
    productId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const query = this.purchaseRepo
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.product', 'product')
      .leftJoinAndSelect('purchase.supplier', 'supplier')
      .leftJoinAndSelect('purchase.order', 'order')
      .orderBy('purchase.purchase_date', 'DESC');

    if (productId) {
      query.andWhere('product.id = :productId', { productId });
    }

    if (startDate) {
      query.andWhere('purchase.purchase_date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('purchase.purchase_date <= :endDate', { endDate });
    }

    const records = await query.getMany();

    return records.map((p) => ({
      productName: p.product.name,
      supplierName: p.supplier?.name || 'Sin proveedor',
      invoiceNumber: p.invoice_number,
      quantity: p.quantity,
      unitCost: p.unit_cost,
      totalCost: p.total_cost,
      purchaseDate: p.purchase_date,
      notes: p.notes,
      orderNumber: p.order?.orderNumber,
    }));
  }

  async getPurchasePriceTrend(productId: string) {
    const records = await this.purchaseRepo.find({
      where: { product: { id: productId } },
      relations: ['product'],
      order: { purchase_date: 'ASC' },
    });

    const grouped: Record<string, ProductPurchase[]> = groupBy(records, (r) =>
      new Date(r.purchase_date).toISOString().slice(0, 7),
    );

    const trend = Object.entries(grouped).map(([month, purchases]) => {
      const avgCost =
        purchases.reduce((sum, p) => sum + Number(p.unit_cost), 0) /
        purchases.length;
      return {
        month,
        unitCost: +avgCost.toFixed(2),
      };
    });

    return trend;
  }

 async getPurchasedProducts() {
  const products = await this.productRepo
    .createQueryBuilder('product')
    .leftJoin('product.brand', 'brand')
    .leftJoin('product.unit_of_measure', 'unit')
    .innerJoin('product.purchase_history', 'purchase') // solo productos comprados
    .select([
      'product.id',
      'product.name',
      'brand.name',
      'unit.name',
    ])
    .groupBy('product.id')
    .addGroupBy('brand.id')
    .addGroupBy('unit.id')
    .getRawMany();

  // Como getRawMany devuelve filas planas con alias, mapeamos para armar objeto:
  return products.map(p => ({
    id: p.product_id,
    name: p.product_name,
    brand: {
      name: p.brand_name,
    },
    unit_of_measure: {
      name: p.unit_name,
    },
  }));
}


}
