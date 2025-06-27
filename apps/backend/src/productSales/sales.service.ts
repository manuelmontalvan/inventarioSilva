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
import { CreateSaleDto,CreateProductSaleDto } from './dto/create-sale.dto';
import { Product } from '../products/entities/product.entity';
import { Customer } from './customers/customer.entity';
import { User } from '../users/user.entity';
import { OrderNumberCounter } from './entities/order-number-counter.entity';


import * as fs from 'fs';
import * as XLSX from 'xlsx';

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
  ) {}

  async create(createSaleDto: CreateSaleDto, user: User): Promise<Sale> {
    const sale = new Sale();
    sale.orderNumber = await this.getNextOrderNumber();
    sale.payment_method = createSaleDto.payment_method;
    sale.status = createSaleDto.status;
    sale.notes = createSaleDto.notes;
    sale.soldBy = user;

    // Aquí decides si quieres que la factura se pase en DTO o la generas aquí
    sale.invoice_number = createSaleDto['invoice_number'] || '';

    let total = 0;
    const productSales: ProductSale[] = [];

    // Obtener fecha global de venta (mínima entre las fechas de las líneas o fecha actual)
    let globalSaleDate = new Date();

    const dates = createSaleDto.productSales
      .map((ps) => (ps.sale_date ? new Date(ps.sale_date) : null))
      .filter((d) => d !== null) as Date[];

    if (dates.length > 0) {
      globalSaleDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    }

    sale.sale_date = globalSaleDate;

    for (const item of createSaleDto.productSales) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
        relations: ['brand', 'unit_of_measure'],
      });
      if (!product)
        throw new NotFoundException(`Product ${item.productId} not found`);

      const total_price = item.quantity * item.unit_price;

      const ps = this.productSaleRepository.create({
        saleId: sale.id, // solo el id de la venta, no el objeto completo
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
        invoice_number: sale.invoice_number, // si tienes factura en la venta
      });

      total += total_price;
      productSales.push(ps);
    }

    sale.total_amount = parseFloat(total.toFixed(2));
    sale.productSales = productSales;

    if (createSaleDto.customerId) {
      const customer = await this.customerRepository.findOne({
        where: { id: createSaleDto.customerId },
      });
      if (!customer)
        throw new NotFoundException(
          `Customer ${createSaleDto.customerId} not found`,
        );
      sale.customer = customer;
    }

    return await this.saleRepository.save(sale);
  }

  async getNextOrderNumber(): Promise<string> {
    const date = new Date();
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const dateStr = `${y}${m}${d}`; // 'YYYYMMDD'

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

    if (dto.invoice_number !== undefined) {
      sale.invoice_number = dto.invoice_number;
    }

    if (dto.status !== undefined) {
      sale.status = dto.status;
    }

    if (dto.notes !== undefined) {
      sale.notes = dto.notes;
    }

    return await this.saleRepository.save(sale); // <-- Aquí devuelves Sale
  }
async importSalesFromExcel(filePath: string, user: User) {
  // Leer archivo Excel
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
 const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);


  // Preparar array para las productSales
  const productSalesToCreate: CreateProductSaleDto[] = [];

  for (const row of rows) {
    // Buscar producto por nombre
    const product = await this.productRepository.findOne({
      where: { name: row['productName'] },
    });

    if (!product) {
      throw new NotFoundException(`Producto no encontrado: ${row['productName']}`);
    }
    if (product.sale_price === undefined) {
  throw new BadRequestException(`El producto ${product.name} no tiene precio de venta asignado.`);
}

    productSalesToCreate.push({
      productId: product.id,
      quantity: Number(row['quantity']),
      unit_price: product.sale_price,
      notes: row['notes'] || '',
      sale_date: new Date(row['saleDate']).toISOString(),

      invoice_number: row['invoice_number'] || '', // por si se quiere guardar también a nivel de línea
    });
  }

  // Crear DTO de venta completo con las productSales importadas
  const createSaleDto: CreateSaleDto = {
    productSales: productSalesToCreate,
    payment_method: 'cash', // podrías parametrizarlo desde el archivo si lo deseas
    status: 'paid',
    notes: 'Importado desde Excel',
    invoice_number: rows[0]['invoice_number'] || '', // se toma de la primera fila
  };

  // Crear la venta con el método existente
  const sale = await this.create(createSaleDto, user);

  // Eliminar archivo después de importar
  fs.unlinkSync(filePath);

  return sale;
}


}
