import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import {Sale } from '../entities/sale.entity'

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  lastname?: string;
  @Column({ unique: true, nullable: true }) // Aquí va la cédula
  identification?: string;
  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @OneToMany(() => Sale, sale => sale.customer)
  sales: Sale[];
}