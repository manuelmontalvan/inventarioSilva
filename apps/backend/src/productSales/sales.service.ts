import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { ProductSale } from './entities/product-sale.entity';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { CreateSaleDto, CreateProductSaleDto } from './dto/create-sale.dto';
import { Product } from '../products/entities/product.entity';
import { Customer } from './customers/customer.entity';
import { User } from '../users/user.entity';
import { OrderNumberCounter } from './entities/order-number-counter.entity';
import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(OrderNumberCounter)
    private readonly orderNumberCounterRepository: Repository<OrderNumberCounter>,
    private readonly dataSource: DataSource,
  ) {}

  private parseDateDMY(dateStr: any): Date | null {
    if (!dateStr) return null;

    if (typeof dateStr === 'string') {
      // Caso string tipo "25/06/2024"
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      const [day, month, year] = parts.map(Number);
      if (!day || !month || !year) return null;
      return new Date(year, month, day);
    }

    if (dateStr instanceof Date) {
      // Si ya es un objeto Date, devuelve directamente
      if (isNaN(dateStr.getTime())) return null;
      return dateStr;
    }

    if (typeof dateStr === 'number') {
      // Excel a veces envía fechas como número (timestamp)
      // Convertir número Excel a JS Date
      // En Excel el 1 es 1900-01-01, ajustamos:
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const jsDate = new Date(excelEpoch.getTime() + dateStr * 86400000);
      if (isNaN(jsDate.getTime())) return null;
      return jsDate;
    }

    return null; // Para cualquier otro tipo desconocido
  }

  async create(createSaleDto: CreateSaleDto, user: User): Promise<Sale> {
    const sale = new Sale();
    sale.orderNumber = await this.getNextOrderNumber();
    sale.payment_method = createSaleDto.payment_method;
    sale.status = createSaleDto.status;
    sale.notes = createSaleDto.notes;
    sale.soldBy = user;
    sale.invoice_number = createSaleDto.invoice_number || '';

    // Asignar temporalmente total_amount = 0 para evitar violación de NOT NULL
    sale.total_amount = 0;

    // Obtener fecha global mínima entre productSales
    const dates = createSaleDto.productSales
      .map((ps) => (ps.sale_date ? new Date(ps.sale_date) : null))
      .filter((d) => d !== null) as Date[];

    sale.sale_date =
      dates.length > 0
        ? new Date(Math.min(...dates.map((d) => d.getTime())))
        : new Date();

    // Guardar venta inicial para obtener el ID
    const savedSale = await this.saleRepository.save(sale);

    // Crear productSales vinculadas a la venta
    const productSales: ProductSale[] = [];
    let total = 0;

    for (const item of createSaleDto.productSales) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
        relations: ['brand', 'unit_of_measure'],
      });
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      const total_price = item.quantity * item.unit_price;

      const ps = this.productSaleRepository.create({
        saleId: savedSale.id,
        productId: product.id,
        product_name: product.name,
        brandId: product.brandId,
        brand_name: product.brand?.name,
        unitOfMeasureId: product.unitOfMeasureId,
        unit_of_measure_name: product.unit_of_measure?.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price,
        notes: item.notes,
        invoice_number: sale.invoice_number,
        sale_date: item.sale_date ? new Date(item.sale_date) : new Date(),
      });

      total += total_price;
      productSales.push(ps);
    }

    // Guardar todas las productSales
    await this.productSaleRepository.save(productSales);

    // Actualizar total en la venta
    savedSale.total_amount = parseFloat(total.toFixed(2));
    savedSale.productSales = productSales;

    // Agregar cliente si corresponde
    if (createSaleDto.customerId) {
      const customer = await this.customerRepository.findOne({
        where: { id: createSaleDto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(
          `Customer ${createSaleDto.customerId} not found`,
        );
      }
      savedSale.customer = customer;
    }
    await this.saleRepository.save(savedSale);
    return this.saleRepository.save(savedSale);
  }

  async importSalesFromExcel(fileBuffer: Buffer, user: User) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const salesPromises: Promise<Sale>[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      if (rows.length === 0) continue;

      const productSalesToCreate: CreateProductSaleDto[] = [];

      let customer: Customer | null = null;
      const firstCustomerName = rows[0]?.['customerName']?.trim();
      if (firstCustomerName) {
        customer = await this.customerRepository.findOne({
          where: { name: firstCustomerName },
        });
        if (!customer) {
          customer = this.customerRepository.create({
            name: firstCustomerName,
          });
          customer = await this.customerRepository.save(customer);
        }
      }

      for (const row of rows) {
        const product = await this.productRepository.findOne({
          where: {
            name: row['productName'],
            brand: { name: row['brandName'] },
            unit_of_measure: { name: row['unitName'] },
          },
          relations: ['brand', 'unit_of_measure'],
        });

        if (!product) {
          throw new NotFoundException(
            `Producto no encontrado: ${row['productName']} en hoja ${sheetName}`,
          );
        }

        if (product.sale_price === undefined) {
          throw new BadRequestException(
            `El producto ${product.name} no tiene precio de venta asignado.`,
          );
        }

        const rawDate = row['saleDate'];
        const parsedDate = this.parseDateDMY(rawDate) ?? new Date();

        productSalesToCreate.push({
          productId: product.id,
          quantity: Number(row['quantity']),
          unit_price: product.sale_price,
          notes: row['notes'] || '',
          sale_date: parsedDate.toISOString(),
          invoice_number: row['invoice_number'] || '',
        });
      }

      const createSaleDto: CreateSaleDto = {
        productSales: productSalesToCreate,
        payment_method: 'cash',
        status: 'paid',
        notes: `Importado desde  ${sheetName}`,
        invoice_number: rows[0]?.['invoice_number'] || '',
        customerId: customer?.id,
      };

      salesPromises.push(this.create(createSaleDto, user));
    }

    // Aquí podrías usar await Promise.all(salesPromises) para esperar todas
    return Promise.all(salesPromises);
  }

  async getNextOrderNumber(): Promise<string> {
    const date = new Date();
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const dateStr = `${y}${m}${d}`;

    let counter = await this.orderNumberCounterRepository.findOne({
      where: { date: dateStr },
    });

    if (!counter) {
      counter = this.orderNumberCounterRepository.create({
        date: dateStr,
        lastNumber: 0,
      });
    }

    counter.lastNumber += 1;
    await this.orderNumberCounterRepository.save(counter);

    const correlativoStr = counter.lastNumber.toString().padStart(4, '0');
    return `ORD-V-${dateStr}-${correlativoStr}`;
  }
  async getSalesHistory(
  productId?: string,
  startDate?: string,
  endDate?: string,
) {
  const query = this.productSaleRepository
    .createQueryBuilder('sale')
    .leftJoinAndSelect('sale.sale', 'parentSale')
    .leftJoinAndSelect('parentSale.customer', 'customer')
    .leftJoinAndSelect('sale.product', 'product')
    .orderBy('sale.sale_date', 'DESC');

  if (productId) {
    query.andWhere('sale.productId = :productId', { productId });
  }

  if (startDate) {
    query.andWhere('sale.sale_date >= :startDate', { startDate });
  }

  if (endDate) {
    query.andWhere('sale.sale_date <= :endDate', { endDate });
  }

  const records = await query.getMany();

  return records.map((s) => ({
    productName: s.product?.name ?? s.product_name,
    brandName: s.brand_name ?? '-',
    unitName: s.unit_of_measure_name ?? '-',
    quantity: s.quantity,
    unitPrice: s.unit_price,
    totalPrice: s.total_price,
    saleDate: s.sale_date,
    customerName: s.sale?.customer?.name ?? 'Sin cliente',
    orderNumber: s.sale?.orderNumber,
    invoiceNumber: s.invoice_number ?? '-',
    notes: s.notes ?? '-',
  }));
}
async getSalePriceTrend(productId: string) {
  const records = await this.productSaleRepository.find({
    where: { productId },
    order: { sale_date: 'ASC' },
  });

  const grouped: Record<string, ProductSale[]> = records.reduce((acc, r) => {
    if (!r.sale_date) return acc; // prevención contra undefined

    const month = new Date(r.sale_date).toISOString().slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(r);
    return acc;
  }, {} as Record<string, ProductSale[]>);

  return Object.entries(grouped).map(([month, sales]) => {
    const avgPrice =
      sales.reduce((sum, s) => sum + Number(s.unit_price), 0) / sales.length;
    return {
      month,
      unitPrice: +avgPrice.toFixed(2),
    };
  });
}

async getSoldProducts() {
  const products = await this.productRepository
    .createQueryBuilder('product')
    .leftJoin('product.brand', 'brand')
    .leftJoin('product.unit_of_measure', 'unit')
    .innerJoin('product.sales', 'ps') // productos que han sido vendidos
    .select([
      'product.id AS product_id',
      'product.name AS product_name',
      'brand.name AS brand_name',
      'unit.name AS unit_name',
    ])
    .groupBy('product.id, brand.name, unit.name')
    .getRawMany();

  return products.map((p) => ({
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



  async findAll() {
    return this.saleRepository.find({
      relations: ['productSales', 'productSales.product', 'customer', 'soldBy'],
      order: { sale_date: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.saleRepository.findOne({
      where: { id },
      relations: ['productSales', 'productSales.product', 'customer', 'soldBy'],
    });
  }

  async update(id: string, dto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.saleRepository.findOne({ where: { id } });
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    if (dto.invoice_number !== undefined)
      sale.invoice_number = dto.invoice_number;
    if (dto.status !== undefined) sale.status = dto.status;
    if (dto.notes !== undefined) sale.notes = dto.notes;

    return this.saleRepository.save(sale);
  }
  async searchProducts(query: string) {
    type RawResult = {
      ps_product_name: string;
      ps_brand_name: string | null;
      ps_unit_of_measure_name: string | null;
    };

    const results = await this.dataSource
      .getRepository(ProductSale)
      .createQueryBuilder('ps')
      .select([
        'ps.product_name AS ps_product_name',
        'ps.brand_name AS ps_brand_name',
        'ps.unit_of_measure_name AS ps_unit_of_measure_name',
      ])
      .where('ps.product_name ILIKE :query', { query: `%${query}%` })
      .groupBy('ps.product_name, ps.brand_name, ps.unit_of_measure_name')
      .limit(20)
      .getRawMany<RawResult>();

    const grouped = results.reduce(
      (acc, item) => {
        const { ps_product_name, ps_brand_name, ps_unit_of_measure_name } =
          item;

        if (!acc[ps_product_name]) {
          acc[ps_product_name] = {
            product_name: ps_product_name,
            brands: new Set<string>(),
            units: new Set<string>(),
          };
        }

        if (ps_brand_name) acc[ps_product_name].brands.add(ps_brand_name);
        if (ps_unit_of_measure_name)
          acc[ps_product_name].units.add(ps_unit_of_measure_name);

        return acc;
      },
      {} as Record<
        string,
        { product_name: string; brands: Set<string>; units: Set<string> }
      >,
    );

    return Object.values(grouped).map((item) => ({
      product_name: item.product_name,
      brands: Array.from(item.brands),
      units: Array.from(item.units),
    }));
  }
  async remove(id: string): Promise<void> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['productSales'],
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    // Eliminar productSales primero (por relaciones)
    await this.productSaleRepository.remove(sale.productSales);

    // Luego eliminar la venta
    await this.saleRepository.remove(sale);
  }

  async removeAll(): Promise<void> {
    const sales = await this.saleRepository.find({
      relations: ['productSales'],
    });

    // Eliminar todas las productSales primero
    const allProductSales = sales.flatMap((s) => s.productSales);
    await this.productSaleRepository.remove(allProductSales);

    // Luego eliminar todas las ventas
    await this.saleRepository.remove(sales);
  }
}
