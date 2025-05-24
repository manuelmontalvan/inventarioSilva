// src/sales/entities/product-sale.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('product_sales')
export class ProductSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, product => product.sales_history)
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @CreateDateColumn()
  sale_date: Date;
}
