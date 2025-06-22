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
import { Locality } from '../locality/locality.entity';

@Injectable()
export class ProductStockService {
  constructor(
    @InjectRepository(ProductStock)
    private stockRepo: Repository<ProductStock>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Locality)
    private localityRepo: Repository<Locality>,
  ) {}

  async create(dto: CreateProductStockDto): Promise<ProductStock> {
    const product = await this.productRepo.findOneBy({ id: dto.productId });
    const locality = await this.localityRepo.findOneBy({ id: dto.localityId });

    if (!product || !locality)
      throw new NotFoundException('Producto o localidad no encontrados');

    const exists = await this.stockRepo.findOneBy({
      product: { id: dto.productId },
      locality: { id: dto.localityId },
    });
    if (exists) throw new ConflictException('Ya existe ese stock');

    const stock = this.stockRepo.create({ ...dto, product, locality });
    return this.stockRepo.save(stock);
  }
  async findAll(productId?: string): Promise<ProductStock[]> {
    if (productId) {
      return this.stockRepo.find({
        where: { product: { id: productId } },
        relations: ['product', 'locality'], // si quieres incluir relaciones
      });
    }
    return this.stockRepo.find({ relations: ['product', 'locality'] });
  }

  async update(id: string, dto: UpdateProductStockDto): Promise<ProductStock> {
    const stock = await this.stockRepo.findOneBy({ id });
    if (!stock) throw new NotFoundException('Stock no encontrado');
    Object.assign(stock, dto);
    return this.stockRepo.save(stock);
  }

  async remove(id: string): Promise<void> {
    const result = await this.stockRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Stock no encontrado');
  }
}
