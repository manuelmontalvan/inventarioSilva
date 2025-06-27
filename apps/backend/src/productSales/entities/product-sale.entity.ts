import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Brand } from '../../products/entities/brand.entity';

import { UnitOfMeasure } from '../../products/entities/unit-of-measure.entity';

import { Product } from '../../products/entities/product.entity';

import { Sale } from './sale.entity';
@Entity('product_sales')
export class ProductSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, (sale) => sale.productSales)
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @Column()
  saleId: string;

  @ManyToOne(() => Product, (product) => product.sales_history, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @Column()
  product_name: string; // nombre del producto para registro histórico

  @ManyToOne(() => Brand, { eager: true, nullable: true })
  @JoinColumn({ name: 'brandId' })
  brand?: Brand;

  @Column({ nullable: true })
  brandId?: string;

  @Column({ nullable: true })
  brand_name?: string; // guardar también nombre marca como histórico (opcional)

  @ManyToOne(() => UnitOfMeasure, { eager: true, nullable: true })
  @JoinColumn({ name: 'unitOfMeasureId' })
  unit_of_measure?: UnitOfMeasure;

  @Column({ nullable: true })
  unitOfMeasureId?: string;

  @Column({ nullable: true })
  unit_of_measure_name?: string; // guardar también nombre unidad para histórico (opcional)

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unit_price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
  @Column({ type: 'varchar', nullable: true })
  invoice_number?: string;
  @Column({ type: 'timestamp', nullable: true })
  sale_date?: Date;
}
