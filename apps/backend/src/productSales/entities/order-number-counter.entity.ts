// src/sales/entities/order-number-counter.entity.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class OrderNumberCounter {
  @PrimaryColumn()
  date: string; // formato 'YYYYMMDD'

  @Column({ default: 0 })
  lastNumber: number;
}
