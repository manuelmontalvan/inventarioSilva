import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { ProductSale } from './entities/product-sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Product } from '../products/entities/product.entity';
import { Customer } from './customers/customer.entity';
import { User } from '../users/user.entity';
import { OrderNumberCounter } from './entities/order-number-counter.entity';
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

    let total = 0;
    const productSales: ProductSale[] = [];

    for (const item of createSaleDto.productSales) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product)
        throw new NotFoundException(`Product ${item.productId} not found`);

      const total_price = item.quantity * item.unit_price;
      const ps = this.productSaleRepository.create({
        product,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price,
        notes: item.notes,
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

    // Formatear número correlativo a 4 dígitos con ceros a la izquierda
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
}
