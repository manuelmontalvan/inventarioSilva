// src/purchases/entities/product-purchase.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_purchases')
export class ProductPurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, product => product.purchase_history)
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @CreateDateColumn()
  purchase_date: Date;
}
