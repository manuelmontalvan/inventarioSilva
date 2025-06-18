import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from '../entities/category.entity';

@Entity()
export class Locality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Category, (category) => category.localities, {
    onDelete: 'CASCADE',
  })
  category: Category;

  @Column()
  categoryId: string;
}
