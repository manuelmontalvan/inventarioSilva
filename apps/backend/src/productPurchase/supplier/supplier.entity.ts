import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductPurchase } from '../entities/product-purchase.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ nullable: true })
  identification?: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  contact_person?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @OneToMany(() => ProductPurchase, purchase => purchase.supplier)
  purchases: ProductPurchase[];
}