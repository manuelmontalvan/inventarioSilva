// purchase-order.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Supplier } from '../supplier/supplier.entity'; // Asegúrate de que la ruta sea correcta
import { User } from '../../users/user.entity'; // Asegúrate de que la ruta sea correcta
import { ProductPurchase } from './product-purchase.entity'; // Asegúrate de que la ruta sea correcta

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoice_number: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'date' })
  purchase_date: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'registeredById' })
  registeredBy: User;

  @OneToMany(() => ProductPurchase, (pp) => pp.order, { cascade: true })
  purchase_lines: ProductPurchase[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
