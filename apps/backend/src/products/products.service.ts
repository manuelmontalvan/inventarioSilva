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
import { Locality } from './locality/entities/locality.entity';
import { ProductCostHistory } from 'src/productPurchase/entities/product-cost-history.entity';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as csv from 'csv-parse/sync';
import { Pagination } from 'src/common/types/pagination';
import { Shelf } from './locality/shelves/entities/shelf.entity';
import { ProductStock } from './product-stock/product-stock.entity';
import { QueryFailedError } from 'typeorm';
import { ProductStockService } from './product-stock/product-stock.service';

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
    @InjectRepository(Shelf)
    private shelfRepository: Repository<Shelf>,
    @InjectRepository(ProductStock)
    private productStockRepository: Repository<ProductStock>,

    private readonly productStockService: ProductStockService,
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
    if (salePrice <= 0 || purchasePrice <= 0) {
      this.logger.warn(
        `❗️[CALC] No se puede calcular margen: salePrice=${salePrice}, purchasePrice=${purchasePrice}`,
      );
      return 0;
    }

    const margin = ((salePrice - purchasePrice) / salePrice) * 100;
    return parseFloat(margin.toFixed(2));
  }

  private calculateSalePrice(
    purchasePrice: number,
    profitMargin: number,
  ): number {
    if (purchasePrice <= 0 || profitMargin <= 0 || profitMargin >= 100) {
      this.logger.warn(
        `❗️[CALC] No se puede calcular precio de venta: purchasePrice=${purchasePrice}, profitMargin=${profitMargin}`,
      );
      return purchasePrice;
    }

    const price = purchasePrice / (1 - profitMargin / 100);
    return parseFloat(price.toFixed(2));
  }

  async create(
    createProductDto: CreateProductDto,
    createdBy: User,
  ): Promise<Product> {
    const {
      categoryId,
      brandId,
      unitOfMeasureId,
      purchase_price,
      profit_margin,
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

    let sale_price = 0;

    if (
      typeof purchase_price === 'number' &&
      purchase_price > 0 &&
      typeof profit_margin === 'number' &&
      profit_margin > 0
    ) {
      sale_price = parseFloat(
        this.calculateSalePrice(purchase_price, profit_margin).toFixed(2),
      );
    }

    const newProduct = this.productRepository.create({
      ...productData,
      purchase_price,
      sale_price,
      profit_margin,
      category,
      brand,
      unit_of_measure: unitOfMeasure,
      createdBy,
      updatedBy: createdBy,
    });

    try {
      const saved = await this.productRepository.save(newProduct);
      this.logger.debug(`[CREATE] Producto creado: ${saved.name}`);
      return saved;
    } catch (error) {
      if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(
          'Barcode or internal code already exists.',
        );
      }
      this.logger.error(
        `Error creando producto: ${error.message}`,
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

  async findAll({
    page = 1,
    limit = 10,
    search = '',
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: Product[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.unit_of_measure', 'unit_of_measure')
      .leftJoinAndSelect('product.createdBy', 'createdBy')
      .leftJoinAndSelect('product.updatedBy', 'updatedBy')
      .leftJoinAndSelect('product.stocks', 'stocks')
      .leftJoinAndSelect('stocks.locality', 'stockLocality')
      .leftJoinAndSelect('stocks.shelf', 'stockShelf')
      .leftJoinAndSelect('stockShelf.locality', 'stockLocality'); // ⬅️ Esto es clave

    if (search) {
      queryBuilder.where(
        'LOWER(product.name) LIKE :search OR LOWER(brand.name) LIKE :search OR LOWER(category.name) LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
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
        'stocks',
        'stocks.locality',
        'stocks.shelf',
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
      purchase_price,
      profit_margin,
      ...productData
    } = updateProductDto;

    if (categoryId) {
      const category = await this.categoryRepository.findOneBy({
        id: categoryId,
      });
      if (!category)
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      product.category = category;
    }

    if (brandId) {
      const brand = await this.brandRepository.findOneBy({ id: brandId });
      if (!brand)
        throw new NotFoundException(`Brand with ID ${brandId} not found`);
      product.brand = brand;
    }

    if (unitOfMeasureId) {
      const unit = await this.unitOfMeasureRepository.findOneBy({
        id: unitOfMeasureId,
      });
      if (!unit)
        throw new NotFoundException(
          `Unit of Measure with ID ${unitOfMeasureId} not found`,
        );
      product.unit_of_measure = unit;
    }

    Object.assign(product, productData);

    const hasNewPurchasePrice = typeof purchase_price === 'number';
    const hasNewProfitMargin = typeof profit_margin === 'number';

    if (hasNewPurchasePrice) {
      product.purchase_price = purchase_price!;
    }

    if (hasNewProfitMargin) {
      product.profit_margin = profit_margin!;
    }

    // Recalcular sale_price si ambos están definidos
    if (
      typeof product.purchase_price === 'number' &&
      product.purchase_price > 0 &&
      typeof product.profit_margin === 'number' &&
      product.profit_margin > 0
    ) {
      product.sale_price = parseFloat(
        this.calculateSalePrice(
          product.purchase_price,
          product.profit_margin,
        ).toFixed(2),
      );

      this.logger.debug(
        `[UPDATE] Recalculado sale_price=${product.sale_price} usando PP=${product.purchase_price} y PM=${product.profit_margin}`,
      );
    }

    product.updatedBy = updatedBy;
    product.last_updated = new Date();

    try {
      const saved = await this.productRepository.save(product);
      this.logger.debug(`[UPDATE] Producto actualizado con id=${id}`);
      return saved;
    } catch (error) {
      if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(
          'Barcode or internal code already exists.',
        );
      }
      this.logger.error(
        `[UPDATE] Error actualizando producto: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.productRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23503'
      ) {
        throw new BadRequestException(
          'No se puede eliminar este producto porque está siendo utilizado en stock, ventas u otras entidades relacionadas.',
        );
      }
      throw error;
    }
  }

  async removeAll(): Promise<void> {
    try {
      await this.productRepository.createQueryBuilder().delete().execute();
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23503'
      ) {
        throw new BadRequestException(
          'No se pueden eliminar todos los productos porque algunos están siendo utilizados en stock, ventas u otras entidades relacionadas.',
        );
      }
      throw error;
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

  //pagination
  async findAllPaginated(
    page: number,
    limit: number,
    categoryIds?: string[],
    search?: string,
  ): Promise<Pagination<Product>> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.unit_of_measure', 'unit_of_measure')
      .leftJoinAndSelect('product.createdBy', 'createdBy')
      .leftJoinAndSelect('product.updatedBy', 'updatedBy')
      .leftJoinAndSelect('product.stocks', 'stocks')
      .leftJoinAndSelect('stocks.locality', 'stockLocality')
      .leftJoinAndSelect('stocks.shelf', 'stockShelf');

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(brand.name) LIKE :search OR LOWER(category.name) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere('category.id IN (:...categoryIds)', {
        categoryIds,
      });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

    let rows: any[] = [];

    if (ext === '.csv') {
      rows = csv.parse(content, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ',',
      });
    } else {
      const workbook = XLSX.read(content, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet);
    }

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
      const unitName = row['unit'] ?? row['unitOfMeasure'];
      const unit =
        (await this.unitOfMeasureRepository.findOne({
          where: { name: unitName },
        })) ??
        (await this.unitOfMeasureRepository.save(
          this.unitOfMeasureRepository.create({
            name: unitName,
            abbreviation: unitName?.substring(0, 3) ?? '',
          }),
        ));

      const product = this.productRepository.create({
        name,
        description: row['description'],
        purchase_price: isNaN(Number(row['purchase_price']))
          ? undefined
          : Number(row['purchase_price']),
        sale_price: isNaN(Number(row['sale_price']))
          ? undefined
          : Number(row['sale_price']),

        internal_code: row['internal_code'] || undefined,
        min_stock: Number(row['min_stock'] ?? 0),
        max_stock: Number(row['max_stock'] ?? 0),

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
        createdBy: { id: userId },
      });
      // Validar precios
      if (
        typeof product.purchase_price !== 'number' ||
        isNaN(product.purchase_price)
      ) {
        product.purchase_price = 0;
      }

      if (typeof product.sale_price !== 'number' || isNaN(product.sale_price)) {
        product.sale_price = 0;
      }

      await this.productRepository.save(product);
 
      created.push(product.name);

      // Opcional: agregar stock en shelf si viene en la fila
      const localityName = row['locality']?.toString()?.trim();
      const shelfName = row['shelf']?.toString()?.trim();
      const quantityInShelfRaw = row['quantity_in_shelf'];
      const quantityInShelf =
        quantityInShelfRaw !== undefined && !isNaN(Number(quantityInShelfRaw))
          ? Number(quantityInShelfRaw)
          : null;

      const shelfMinStock =
        row['shelf_min_stock'] !== undefined
          ? Number(row['shelf_min_stock'])
          : 0;
      const shelfMaxStock =
        row['shelf_max_stock'] !== undefined
          ? Number(row['shelf_max_stock'])
          : 0;

      if (localityName && shelfName && quantityInShelf !== null) {
        const locality =
          (await this.localityRepository.findOne({
            where: { name: localityName },
          })) ??
          (await this.localityRepository.save(
            this.localityRepository.create({ name: localityName }),
          ));

        const shelf =
          (await this.shelfRepository.findOne({
            where: {
              name: shelfName,
              locality: { id: locality.id },
            },
            relations: ['locality'],
          })) ??
          (await this.shelfRepository.save(
            this.shelfRepository.create({
              name: shelfName,
              locality,
              category: product.category,
            }),
          ));

        const stock = this.productStockRepository.create({
          product,
          productId: product.id, 
          shelf,
          shelfId: shelf.id,
          locality,
          localityId: locality.id,
          quantity: quantityInShelf,
          min_stock: shelfMinStock,
          max_stock: shelfMaxStock,
        });
        
        await this.productStockRepository.save(stock);
        await this.productStockService.updateProductTotalStock(product.id);
      }
    }

    fs.unlinkSync(filePath);

    return {
      productos: created,
    };
  }
}
