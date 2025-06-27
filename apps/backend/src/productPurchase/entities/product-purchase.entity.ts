// src/purchases/product-purchase.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Supplier } from '../supplier/supplier.entity';
import { User } from '../../users/user.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { Brand } from '../../products/entities/brand.entity'; // Ajusta ruta
import { UnitOfMeasure } from '../../products/entities/unit-of-measure.entity'; // Ajusta ruta

@Entity('product_purchases')
export class ProductPurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.purchase_history, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
  @ManyToOne(() => Brand, { eager: true, nullable: true })
  @JoinColumn({ name: 'brandId' })
  brand?: Brand;

  @ManyToOne(() => UnitOfMeasure, { eager: true, nullable: true })
  @JoinColumn({ name: 'unitId' })
  unit_of_measure?: UnitOfMeasure;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_cost: number;

  @Column()
  invoice_number: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchases, { eager: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @ManyToOne(() => PurchaseOrder, (order) => order.purchase_lines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: PurchaseOrder;

  @Column({ type: 'date' })
  purchase_date: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'registeredById' })
  registeredBy: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
