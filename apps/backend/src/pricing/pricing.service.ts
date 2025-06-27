import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarginConfig } from './entities/margin-config.entity';
import { Tax } from './entities/tax.entity';
import { CreateMarginConfigDto } from './dto/create-margin-config.dto';
import { UpdateMarginConfigDto } from './dto/update-margin-config.dto';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Category } from '../products/entities/category.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(MarginConfig)
    private readonly marginRepo: Repository<MarginConfig>,
    @InjectRepository(Tax)
    private readonly taxRepo: Repository<Tax>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // === Margin Config ===

  async createMargin(dto: CreateMarginConfigDto) {
    let category: Category | null = null;

    if (dto.categoryId) {
      category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    const config = this.marginRepo.create({
      percentage: dto.percentage,
      category,
    });

    const savedMargin = await this.marginRepo.save(config);

    // Actualizar productos
    await this.updateProductsProfitMargin(dto.percentage ?? 0, dto.categoryId ?? undefined);


    return savedMargin;
  }

  async updateMargin(id: string, dto: UpdateMarginConfigDto) {
    const config = await this.marginRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!config) throw new NotFoundException('Configuración no encontrada');

    let category: Category | null = null;
    if (dto.categoryId) {
      category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
      config.category = category;
    } else {
      config.category = null;
    }

    config.percentage = dto.percentage ?? 0;

    const saved = await this.marginRepo.save(config);

    // Actualizar productos
   await this.updateProductsProfitMargin(dto.percentage ?? 0, dto.categoryId ?? undefined);


    return saved;
  }

  async getAllMargins() {
    return this.marginRepo.find({ relations: ['category'] });
  }

  async deleteMargin(id: string) {
    const config = await this.marginRepo.findOneBy({ id });
    if (!config) throw new NotFoundException('Margen no encontrado');
    return this.marginRepo.delete(id);
  }

  // === Taxes ===

  async createTax(dto: CreateTaxDto) {
    const tax = this.taxRepo.create(dto);
    return this.taxRepo.save(tax);
  }

  async updateTax(id: string, dto: UpdateTaxDto) {
    const tax = await this.taxRepo.findOneBy({ id });
    if (!tax) throw new NotFoundException('Impuesto no encontrado');
    Object.assign(tax, dto);
    return this.taxRepo.save(tax);
  }

  async getAllTaxes() {
    return this.taxRepo.find();
  }

  async deleteTax(id: string) {
    const tax = await this.taxRepo.findOneBy({ id });
    if (!tax) throw new NotFoundException('Impuesto no encontrado');
    return this.taxRepo.delete(id);
  }

  // === Actualizar margen en productos ===

private async updateProductsProfitMargin(
  percentage: number,
  categoryId?: string,
) {
  const query = this.productRepo
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.category', 'category');

  if (categoryId) {
    query.where('category.id = :categoryId', { categoryId });
  }

  const products = await query.getMany();

  for (const product of products) {
    product.profit_margin = percentage;

    if (product.purchase_price && percentage > 0) {
      product.sale_price = parseFloat(
        (product.purchase_price / (1 - percentage / 100)).toFixed(2),
      );
    }

    await this.productRepo.save(product);
  }
}


}
