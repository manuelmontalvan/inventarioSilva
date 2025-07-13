// src/products/entities/product-stock.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  JoinColumn
} from 'typeorm';
import { Product } from '../entities/product.entity';
import { Locality } from '../locality/entities/locality.entity';
import { Shelf } from '../locality/shelves/entities/shelf.entity';

@Entity('product_stocks')
@Unique(['product', 'shelf'])
export class ProductStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.stocks, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => Locality, { eager: true })
  @JoinColumn({ name: 'localityId' })
  locality: Locality;

  @Column()
  localityId: string;
  
  @ManyToOne(() => Shelf, { eager: true })
  @JoinColumn({ name: 'shelfId' })
  shelf: Shelf;

  @Column()
  shelfId: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  min_stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  max_stock: number;
}
