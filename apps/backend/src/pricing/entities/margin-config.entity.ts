import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Category } from '../../products/entities/category.entity';

@Entity()
@Unique(['category']) // Una configuración por categoría
export class MarginConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float')
  percentage: number;

  @ManyToOne(() => Category, { nullable: true, eager: true })
 category: Category | null; // null = margen global
}
