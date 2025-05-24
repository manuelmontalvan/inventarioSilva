// src/products/entities/product.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { UnitOfMeasure } from './unit-of-measure.entity';
import { ProductSale } from './product-sale.entity';
import { ProductPurchase } from './product-purchase.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Category, { eager: true })
  category: Category;

  @ManyToOne(() => Brand, { eager: true })
  brand: Brand;

  @Column({ unique: true })
  @Index()
  barcode: string;

  @Column({ nullable: true })
  @Index()
  internal_code?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  current_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  min_stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  max_stock: number;

  @Column({ nullable: true })
  warehouse_location?: string;

  @ManyToOne(() => UnitOfMeasure, { eager: true })
  unit_of_measure: UnitOfMeasure;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchase_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sale_price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  profit_margin: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount?: number;

  @CreateDateColumn()
  entry_date: Date;

  @UpdateDateColumn()
  last_updated: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_purchase_date?: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_sale_date?: Date;

  @Column({ type: 'int', default: 0 })
  sales_frequency: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPerishable: boolean;

  @Column({ type: 'date', nullable: true })
  expiration_date?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => ProductSale, sale => sale.product)
  sales_history: ProductSale[];

  @OneToMany(() => ProductPurchase, purchase => purchase.product)
  purchase_history: ProductPurchase[];

  @Column({ nullable: true })
  current_trend?: 'growing' | 'declining' | 'stable';

  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  updated_by?: string;
}
