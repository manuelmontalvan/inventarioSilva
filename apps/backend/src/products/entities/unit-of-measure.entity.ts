// src/units/entities/unit-of-measure.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('units_of_measure')
export class UnitOfMeasure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  abbreviation: string;

  @OneToMany(() => Product, product => product.unit_of_measure)
  products: Product[];
}
