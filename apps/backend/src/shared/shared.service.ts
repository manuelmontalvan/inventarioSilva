import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { PurchaseOrder } from '../productPurchase/entities/purchase-order.entity';
import { Sale } from '../productSales/entities/sale.entity';

@Injectable()
export class SharedService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepo: Repository<PurchaseOrder>,

    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,

     @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getOrderDetailsByOrderNumber(orderNumber: string) {
    if (orderNumber.startsWith('OC-')) {
      // Orden de compra
      const purchaseOrder = await this.purchaseOrderRepo.findOne({
        where: { orderNumber },
        relations: [
          'purchase_lines',
          'purchase_lines.product',
          'purchase_lines.product.brand',
          'purchase_lines.product.unit_of_measure',
        ],
      });

      if (!purchaseOrder) {
        throw new NotFoundException('Orden de compra no encontrada');
      }

      return {
        type: 'purchase',
        orderNumber: purchaseOrder.orderNumber,
        items: purchaseOrder.purchase_lines.map((line) => ({
          productId: line.product.id,
          productName: line.product.name,
          brand: line.product.brand?.name,
          unit: line.product.unit_of_measure?.name,
          quantity: line.quantity,
          unitPrice: line.unit_cost,
          totalPrice: line.total_cost,
          notes: line.notes,
        })),
      };
    } else if (orderNumber.startsWith('ORD-V-')) {
      // Orden de venta
      const sale = await this.saleRepo.findOne({
        where: { orderNumber },
        relations: [
          'productSales',
          'productSales.product',
          'productSales.product.brand',
          'productSales.product.unit_of_measure',
        ],
      });

      if (!sale) {
        throw new NotFoundException('Orden de venta no encontrada');
      }

      return {
        type: 'sale',
        orderNumber: sale.orderNumber,
        items: sale.productSales.map((line) => ({
          productId: line.productId,
          productName: line.product?.name ?? line.product_name,
          brand: line.brand_name,
          unit: line.unit_of_measure_name,
          quantity: line.quantity,
          unitPrice: line.unit_price,
          totalPrice: line.total_price,
          notes: line.notes,
        })),
      };
    } else {
      throw new BadRequestException('Formato de número de orden no reconocido');
    }
  }
  
  
  
 async getMonthlySalesAndPurchases(startMonth?: string, endMonth?: string) {
  const purchaseQuery = this.purchaseOrderRepo
    .createQueryBuilder('purchase')
    .leftJoin('purchase.purchase_lines', 'lines')
    .select("TO_CHAR(purchase.purchase_date, 'YYYY-MM')", 'month')
    .addSelect('COALESCE(SUM(lines.total_cost), 0)', 'totalPurchases');

  const saleQuery = this.saleRepo
    .createQueryBuilder('sale')
    .select("TO_CHAR(sale.sale_date, 'YYYY-MM')", 'month')
    .addSelect('COALESCE(SUM(sale.total_amount), 0)', 'totalSales');

  if (startMonth) {
    purchaseQuery.andWhere(
      "TO_CHAR(purchase.purchase_date, 'YYYY-MM') >= :startMonth",
      { startMonth },
    );
    saleQuery.andWhere(
      "TO_CHAR(sale.sale_date, 'YYYY-MM') >= :startMonth",
      { startMonth },
    );
  }

  if (endMonth) {
    purchaseQuery.andWhere(
      "TO_CHAR(purchase.purchase_date, 'YYYY-MM') <= :endMonth",
      { endMonth },
    );
    saleQuery.andWhere(
      "TO_CHAR(sale.sale_date, 'YYYY-MM') <= :endMonth",
      { endMonth },
    );
  }

  // Agrupación y ordenamiento
  purchaseQuery.groupBy('month').orderBy('month', 'ASC');
  saleQuery.groupBy('month').orderBy('month', 'ASC');

  // ✅ Ejecutar recién aquí
  const monthlyPurchases = await purchaseQuery.getRawMany();
  const monthlySales = await saleQuery.getRawMany();

  // Combinar resultados
  const mapPurchases = new Map(
    monthlyPurchases.map((p) => [p.month, Number(p.totalPurchases)]),
  );
  const mapSales = new Map(
    monthlySales.map((s) => [s.month, Number(s.totalSales)]),
  );

  const allMonths = Array.from(
    new Set([...mapPurchases.keys(), ...mapSales.keys()]),
  ).sort();

  return allMonths.map((month) => ({
    month,
    totalPurchases: mapPurchases.get(month) || 0,
    totalSales: mapSales.get(month) || 0,
  }));
}
async getTotalProducts() {
  const total = await this.productRepo.count();
  return { total };
}
// SharedService
async getAvailableMonths(): Promise<string[]> {
  // Consulta que devuelve todos los meses donde hay ventas o compras ordenados asc
  const purchaseMonths = await this.purchaseOrderRepo
    .createQueryBuilder('purchase')
    .select("DISTINCT TO_CHAR(purchase.purchase_date, 'YYYY-MM')", 'month')
    .orderBy('month', 'ASC')
    .getRawMany();

  const saleMonths = await this.saleRepo
    .createQueryBuilder('sale')
    .select("DISTINCT TO_CHAR(sale.sale_date, 'YYYY-MM')", 'month')
    .orderBy('month', 'ASC')
    .getRawMany();

  const monthsSet = new Set<string>();
  purchaseMonths.forEach((m) => monthsSet.add(m.month));
  saleMonths.forEach((m) => monthsSet.add(m.month));

  return Array.from(monthsSet).sort();
}


}
