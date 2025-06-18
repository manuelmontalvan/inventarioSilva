import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Customer } from './customer.entity';
import { User } from '../../users/user.entity'; // Para saber quién realizó la venta

@Entity('product_sales')
export class ProductSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, product => product.sales_history)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number; // Precio unitario de venta en esta transacción

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number; // Cantidad * Precio Unitario

  @Column({ nullable: true })
  invoice_number?: string; // Número de factura de venta

  @ManyToOne(() => Customer, customer => customer.sales)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'date' })
  sale_date: Date; // Fecha de la venta/salida

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'soldById' })
  soldBy: User; // Usuario que realizó esta venta

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}