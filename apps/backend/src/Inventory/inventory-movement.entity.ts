// src/Inventory/inventory-movement.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Locality } from '../products/locality/locality.entity';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
}

@Entity()
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MovementType })
  type: MovementType;

  @Column('int')
  quantity: number;

  @ManyToOne(() => Product, (product) => product.inventoryMovements)
  product: Product;

  @ManyToOne(() => Locality, { eager: true })
  locality: Locality;

  @Column({ nullable: true }) // ✅ Permite sincronizar sin error
  localityId: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  invoice_number: string;

  @Column({ unique: true, nullable: true })
  orderNumber: string;

  @CreateDateColumn()
  createdAt: Date;
}
