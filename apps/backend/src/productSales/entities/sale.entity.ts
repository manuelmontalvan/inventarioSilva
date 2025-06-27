import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductSale } from './product-sale.entity';
import { Customer } from '../customers/customer.entity';
import { User } from '../../users/user.entity';
@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => ProductSale, (ps) => ps.sale, { cascade: true })
  productSales: ProductSale[];

  @ManyToOne(() => Customer, (c) => c.sales, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ nullable: true, unique: true })
  orderNumber?: string;

  @Column({ type: 'varchar', default: '' })
  invoice_number: string; // Aquí está la factura, no opcional, default cadena vacía

  @Column({ type: 'enum', enum: ['cash', 'credit', 'transfer'], default: 'cash' })
  payment_method: 'cash' | 'credit' | 'transfer';

  @Column({ type: 'enum', enum: ['paid', 'pending', 'cancelled'], default: 'paid' })
  status: 'paid' | 'pending' | 'cancelled';

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'soldById' })
  soldBy: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sale_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
