import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { UnitOfMeasure } from './entities/unit-of-measure.entity';
import { User } from '../users/user.entity'; // Asegúrate de que la ruta sea correcta
import { Locality } from './locality/locality.entity';
import { ProductCostHistory } from 'src/productPurchase/entities/product-cost-history.entity';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as csv from 'csv-parse/sync';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(UnitOfMeasure)
    private unitOfMeasureRepository: Repository<UnitOfMeasure>,
    @InjectRepository(ProductCostHistory)
    private productCostHistoryRepository: Repository<ProductCostHistory>,
    @InjectRepository(Locality)
    private localityRepository: Repository<Locality>,
  ) {}

  /**
   * Calcula el margen de ganancia porcentual.
   * @param salePrice Precio de venta del producto.
   * @param purchasePrice Precio de compra del producto.
   * @returns Margen de ganancia en porcentaje (ej. 25.50).
   */
  private calculateProfitMargin(
    salePrice: number,
    purchasePrice: number,
  ): number {
    if (salePrice <= 0) {
      this.logger.warn(
        `Sale price is zero or less for profit margin calculation. Sale: ${salePrice}, Purchase: ${purchasePrice}`,
      );
      return 0; // Evitar división por cero o márgenes infinitos
    }
    return ((salePrice - purchasePrice) / salePrice) * 100;
  }

  private calculateSalePrice(purchasePrice: number, profitMargin: number): number {
    if (purchasePrice <= 0 || profitMargin <= 0) {
      return purchasePrice;
    }
    return purchasePrice / (1 - profitMargin / 100);
  }

  async create(
    createProductDto: CreateProductDto,
    createdBy: User,
  ): Promise<Product> {
    const {
      categoryId,
      brandId,
      unitOfMeasureId,
      localityId,
      purchase_price,
      sale_price,
      ...productData
    } = createProductDto;

    const category = await this.categoryRepository.findOneBy({
      id: categoryId,
    });
    if (!category)
      throw new NotFoundException(`Category with ID ${categoryId} not found`);

    const brand = await this.brandRepository.findOneBy({ id: brandId });
    if (!brand)
      throw new NotFoundException(`Brand with ID ${brandId} not found`);

    const unitOfMeasure = await this.unitOfMeasureRepository.findOneBy({
      id: unitOfMeasureId,
    });
    if (!unitOfMeasure)
      throw new NotFoundException(
        `Unit of Measure with ID ${unitOfMeasureId} not found`,
      );

    const locality = await this.localityRepository.findOneBy({
      id: localityId,
    });
    if (!locality)
      throw new NotFoundException(`Locality with ID ${localityId} not found`);

    const profit_margin = this.calculateProfitMargin(
      sale_price,
      purchase_price,
    );

    const newProduct = this.productRepository.create({
      ...productData,
      purchase_price,
      sale_price,
      profit_margin: parseFloat(profit_margin.toFixed(2)),
      category,
      brand,
      unit_of_measure: unitOfMeasure,
      locality, // 👈 Aquí se asigna la localidad
      createdBy,
      updatedBy: createdBy,
    });

    try {
      return await this.productRepository.save(newProduct);
    } catch (error) {
      if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(
          'Barcode or internal code already exists.',
        );
      }
      this.logger.error(
        `Error creating product: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async getCostHistory(productId: string): Promise<ProductCostHistory[]> {
    const histories = await this.productCostHistoryRepository.find({
      where: { product: { id: productId } },
      order: { date: 'DESC' },
      relations: ['purchaseOrder'],
    });

    return histories;
  }

  async findAll(search?: string): Promise<Product[]> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.unit_of_measure', 'unit_of_measure')
      .leftJoinAndSelect('product.locality', 'locality')
      .leftJoinAndSelect('product.createdBy', 'createdBy')
      .leftJoinAndSelect('product.updatedBy', 'updatedBy');

    if (search) {
      queryBuilder.where(
        'LOWER(product.name) LIKE :search OR LOWER(brand.name) LIKE :search OR LOWER(category.name) LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    return queryBuilder.take(10).getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'category',
        'brand',
        'unit_of_measure',
        'createdBy',
        'updatedBy',
        'locality',
      ],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

async update(
  id: string,
  updateProductDto: UpdateProductDto,
  updatedBy: User,
): Promise<Product> {
  const product = await this.findOne(id);

  const {
    categoryId,
    brandId,
    unitOfMeasureId,
    localityId,
    purchase_price,
    sale_price,
    profit_margin,
    ...productData
  } = updateProductDto;

  if (categoryId) {
    const category = await this.categoryRepository.findOneBy({ id: categoryId });
    if (!category)
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    product.category = category;
  }

  if (brandId) {
    const brand = await this.brandRepository.findOneBy({ id: brandId });
    if (!brand) throw new NotFoundException(`Brand with ID ${brandId} not found`);
    product.brand = brand;
  }

  if (unitOfMeasureId) {
    const unitOfMeasure = await this.unitOfMeasureRepository.findOneBy({ id: unitOfMeasureId });
    if (!unitOfMeasure)
      throw new NotFoundException(
        `Unit of Measure with ID ${unitOfMeasureId} not found`,
      );
    product.unit_of_measure = unitOfMeasure;
  }

  if (localityId) {
    const locality = await this.localityRepository.findOneBy({ id: localityId });
    if (!locality) throw new NotFoundException(`Locality with ID ${localityId} not found`);
    product.locality = locality;
  }

  Object.assign(product, productData);

  // Valores actuales o nuevos
  const currentPurchasePrice = purchase_price ?? product.purchase_price;
  const currentProfitMargin = profit_margin ?? product.profit_margin;
  const currentSalePrice = sale_price ?? product.sale_price;

  // Lógica para actualizar precios y margen
  if (purchase_price !== undefined || profit_margin !== undefined) {
    // Recalcular sale_price según purchasePrice y profitMargin
    product.purchase_price = currentPurchasePrice;
    product.profit_margin = currentProfitMargin;
    product.sale_price = parseFloat(
      this.calculateSalePrice(currentPurchasePrice, currentProfitMargin).toFixed(2),
    );
  } else if (sale_price !== undefined) {
    // Si cambia sólo sale_price, recalcular profit_margin basado en sale_price y purchase_price actual
    product.sale_price = currentSalePrice;
    product.profit_margin = parseFloat(
      this.calculateProfitMargin(currentSalePrice, currentPurchasePrice).toFixed(2),
    );
    product.purchase_price = currentPurchasePrice;
  }

  product.updatedBy = updatedBy;
  product.last_updated = new Date();

  try {
    return await this.productRepository.save(product);
  } catch (error) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('Barcode or internal code already exists.');
    }
    this.logger.error(`Error updating product: ${error.message}`, error.stack);
    throw error;
  }
}


  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  // Métodos internos para que otros servicios actualicen la cantidad, fechas, etc.
  async updateProductQuantity(
    productId: string,
    change: number,
    transactionRunner?: any,
  ): Promise<void> {
    const repo = transactionRunner
      ? transactionRunner.manager.getRepository(Product)
      : this.productRepository;
    const product = await repo.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${productId} not found for quantity update`,
      );
    }
    const newQuantity = product.current_quantity + change;
    if (newQuantity < 0) {
      throw new BadRequestException(
        `Insufficient stock for product "${product.name}". Current: ${product.current_quantity}`,
      );
    }
    product.current_quantity = newQuantity;
    await repo.save(product);
    this.logger.debug(
      `Product ${product.name} quantity updated by ${change}. New quantity: ${product.current_quantity}`,
    );
  }

  async updateLastPurchaseDate(
    productId: string,
    date: Date,
    transactionRunner?: any,
  ): Promise<void> {
    const repo = transactionRunner
      ? transactionRunner.manager.getRepository(Product)
      : this.productRepository;
    await repo.update(productId, { last_purchase_date: date });
    this.logger.debug(
      `Product ${productId} last_purchase_date updated to ${date.toISOString()}`,
    );
  }

  async updateLastSaleInfo(
    productId: string,
    date: Date,
    transactionRunner?: any,
  ): Promise<void> {
    const repo = transactionRunner
      ? transactionRunner.manager.getRepository(Product)
      : this.productRepository;
    const product = await repo.findOneBy({ id: productId });
    if (product) {
      product.last_sale_date = date;
      product.sales_frequency = (product.sales_frequency || 0) + 1;
      await repo.save(product);
      this.logger.debug(
        `Product ${product.name} last_sale_date and sales_frequency updated.`,
      );
    }
  }

async importProductsFromFile(filePath: string, ext: string, userId: string) {
  const content = fs.readFileSync(filePath);

  const rows =
    ext === '.csv'
      ? csv.parse(content, {
          columns: true,
          skip_empty_lines: true,
          delimiter: ',',
        })
      : XLSX.utils.sheet_to_json(
          XLSX.read(content, { type: 'buffer' }).Sheets['Sheet1'],
        );
  console.log('Rows importados:', rows);

  const created: string[] = [];

  for (const row of rows) {
    const name = row['name']?.toString();
    if (!name) continue;

    // Buscar o crear categoría
    const category =
      (await this.categoryRepository.findOne({
        where: { name: row['category'] },
      })) ??
      (await this.categoryRepository.save(
        this.categoryRepository.create({ name: row['category'] }),
      ));

    // Buscar o crear marca
    const brand =
      (await this.brandRepository.findOne({
        where: { name: row['brand'] },
      })) ??
      (await this.brandRepository.save(
        this.brandRepository.create({ name: row['brand'] }),
      ));

    // Buscar o crear unidad
    const unit =
      (await this.unitOfMeasureRepository.findOne({
        where: { name: row['unit'] },
      })) ??
      (await this.unitOfMeasureRepository.save(
        this.unitOfMeasureRepository.create({
          name: row['unit'],
          abbreviation: row['unit'].substring(0, 3),
        }),
      ));

    const product = this.productRepository.create({
      name,
      description: row['description'],
      purchase_price: Number(row['purchase_price']),
      sale_price: Number(row['sale_price']),
      internal_code: row['internal_code'] || undefined,
      min_stock: Number(row['min_stock'] || 0),
      max_stock: Number(row['max_stock'] || 0),
      category,
      brand,
      unit_of_measure: unit,
      profit_margin: row['profit_margin']
        ? Number(row['profit_margin'])
        : this.calculateProfitMargin(
            Number(row['sale_price']),
            Number(row['purchase_price']),
          ),
      isPerishable: row['isPerishable'] === 'true',
      expiration_date: row['expiration_date']
        ? new Date(row['expiration_date'])
        : undefined,
      createdBy: { id: userId }, // ✅ Aquí sí colocas correctamente el userId
    });

    await this.productRepository.save(product);
    created.push(product.name);
  }

  fs.unlinkSync(filePath);
  return {
    message: `${created.length} productos creados`,
    productos: created,
  };
}

}
