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
      throw new NotFoundException('Producto, localidad o percha no encontrados');
    }

    const existing = await this.stockRepo.findOneBy({
      product: { id: dto.productId },
      locality: { id: dto.localityId },
      shelf: { id: dto.shelfId }, // <== duplicado por producto-localidad-percha
    });

    if (existing) {
      throw new ConflictException('Ya existe un stock para ese producto, localidad y percha');
    }

    const stock = this.stockRepo.create({
      ...dto,
      product,
      locality,
      shelf,
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
    }

    if (dto.localityId) {
      const locality = await this.localityRepo.findOneBy({ id: dto.localityId });
      if (!locality) throw new NotFoundException('Localidad no encontrada');
      stock.locality = locality;
    }

    if (dto.shelfId) {
      const shelf = await this.shelfRepo.findOneBy({ id: dto.shelfId });
      if (!shelf) throw new NotFoundException('Percha no encontrada');
      stock.shelf = shelf;
    }

    Object.assign(stock, dto);
    return this.stockRepo.save(stock);
  }

  async remove(id: string): Promise<void> {
    const result = await this.stockRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Stock no encontrado');
    }
  }
}
