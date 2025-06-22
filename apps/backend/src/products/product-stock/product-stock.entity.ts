// src/products/entities/product-stock.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Product } from '../entities/product.entity';
import { Locality } from '../locality/locality.entity';

@Entity('product_stocks')
@Unique(['product', 'locality'])
export class ProductStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.stocks, { eager: true })
  product: Product;

  @ManyToOne(() => Locality, { eager: true })
  locality: Locality;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  min_stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  max_stock: number;
}
