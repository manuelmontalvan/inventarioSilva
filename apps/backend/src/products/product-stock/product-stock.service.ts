// src/products/product-stock.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductStock } from './product-stock.entity';
import { CreateProductStockDto } from './dto/create-product-stock.dto';
import { UpdateProductStockDto } from './dto/update-product-stock.dto';
import { Product } from '../entities/product.entity';
import { Locality } from '../locality/entities/locality.entity';
import { Shelf } from '../locality/shelves/entities/shelf.entity'; // Asegúrate de la ruta

@Injectable()
export class ProductStockService {
  constructor(
    @InjectRepository(ProductStock)
    private readonly stockRepo: Repository<ProductStock>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Locality)
    private readonly localityRepo: Repository<Locality>,

    @InjectRepository(Shelf)
    private readonly shelfRepo: Repository<Shelf>, // <== NUEVO
  ) {}

  async create(dto: CreateProductStockDto): Promise<ProductStock> {
    const [product, locality, shelf] = await Promise.all([
      this.productRepo.findOneBy({ id: dto.productId }),
      this.localityRepo.findOneBy({ id: dto.localityId }),
      this.shelfRepo.findOneBy({ id: dto.shelfId }), // <== NUEVO
    ]);

    if (!product || !locality || !shelf) {
      throw new NotFoundException(
        'Producto, localidad o percha no encontrados',
      );
    }

    const existing = await this.stockRepo.findOneBy({
      product: { id: dto.productId },
      locality: { id: dto.localityId },
      shelf: { id: dto.shelfId }, // <== duplicado por producto-localidad-percha
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un stock para ese producto, localidad y percha',
      );
    }

    const stock = this.stockRepo.create({
      ...dto,
      product,
      productId: product.id,
      locality,
      localityId: locality.id,
      shelf,
      shelfId: shelf.id,
    });

    return this.stockRepo.save(stock);
  }

  async findAll(productId?: string): Promise<ProductStock[]> {
    return this.stockRepo.find({
      where: productId ? { product: { id: productId } } : {},
      relations: ['product', 'locality', 'shelf'], // <== incluye shelf
      order: { locality: { name: 'ASC' } },
    });
  }

  async update(id: string, dto: UpdateProductStockDto): Promise<ProductStock> {
    const stock = await this.stockRepo.findOne({
      where: { id },
      relations: ['product', 'locality', 'shelf'],
    });

    if (!stock) {
      throw new NotFoundException('Stock no encontrado');
    }

    // Si deseas permitir cambiar de shelf/localidad/producto en update:
    if (dto.productId) {
      const product = await this.productRepo.findOneBy({ id: dto.productId });
      if (!product) throw new NotFoundException('Producto no encontrado');
      stock.product = product;
      stock.productId = product.id;
    }

    if (dto.localityId) {
      const locality = await this.localityRepo.findOneBy({
        id: dto.localityId,
      });
      if (!locality) throw new NotFoundException('Localidad no encontrada');
      stock.locality = locality;
    }

    if (dto.shelfId) {
      const shelf = await this.shelfRepo.findOneBy({ id: dto.shelfId });
      if (!shelf) throw new NotFoundException('Percha no encontrada');
      stock.shelf = shelf;
    }

    Object.assign(stock, dto);
    // Guardar cambios en stock
    const updatedStock = await this.stockRepo.save(stock);

    // Actualizar cantidad total en producto sumando todas sus stocks
    await this.updateProductTotalStock(updatedStock.productId);

    return updatedStock;
  }

  async updateProductTotalStock(productId: string) {
    const result = await this.stockRepo
      .createQueryBuilder('stock')
      .select('SUM(stock.quantity)', 'total')
      .where('stock.productId = :productId', { productId })
      .getRawOne();

    const total = parseFloat(result?.total ?? '0');

    await this.productRepo.update(productId, {
      current_quantity: total,
    });
  }

async getProductStockTotals(): Promise<
  {
    productId: string;
    productName: string;
    localityId: string;
    localityName: string;
    quantity: number;
  }[]
> {
  const result = await this.stockRepo
    .createQueryBuilder('stock')
    .leftJoin('stock.product', 'product')
    .leftJoin('stock.locality', 'locality')
    .select('product.id', 'productId')
    .addSelect('product.name', 'productName')
    .addSelect('locality.id', 'localityId')
    .addSelect('locality.name', 'localityName')
    .addSelect('SUM(stock.quantity)', 'quantity')
    .groupBy('product.id')
    .addGroupBy('product.name')
    .addGroupBy('locality.id')
    .addGroupBy('locality.name')
    .orderBy('product.name', 'ASC')
    .addOrderBy('locality.name', 'ASC')
    .getRawMany();

  return result.map((row) => ({
    productId: row.productId,
    productName: row.productName,
    localityId: row.localityId,
    localityName: row.localityName,
    quantity: parseFloat(row.quantity),
  }));
}

  async remove(id: string): Promise<void> {
    const result = await this.stockRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Stock no encontrado');
    }
  }

  async searchStocks(search?: string): Promise<ProductStock[]> {
    const query = this.stockRepo
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.unit_of_measure', 'unit')
      .leftJoinAndSelect('stock.locality', 'locality')
      .leftJoinAndSelect('stock.shelf', 'shelf');

    if (search) {
      query
        .where('product.name ILIKE :search', { search: `%${search}%` })
        .orWhere('brand.name ILIKE :search', { search: `%${search}%` })
        .orWhere('locality.name ILIKE :search', { search: `%${search}%` })
        .orWhere('shelf.name ILIKE :search', { search: `%${search}%` });
    }

    return query.orderBy('product.name', 'ASC').getMany();
  }
}
