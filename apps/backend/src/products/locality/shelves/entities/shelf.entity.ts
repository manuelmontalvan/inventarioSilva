import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,OneToMany } from 'typeorm';
import { Locality } from '../../entities/locality.entity';
import { Category } from 'src/products/entities/category.entity';
import { ProductStock } from 'src/products/product-stock/product-stock.entity';

@Entity()
export class Shelf {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Locality, (locality) => locality.shelves, {
    onDelete: 'CASCADE',
  })
  locality: Locality;

  @Column()
  localityId: string;

  @ManyToOne(() => Category, { eager: true }) // cargamos categoría automáticamente
  category: Category;

  @Column()
  categoryId: string;
  
  @OneToMany(() => ProductStock, (stock) => stock.shelf)
  stocks: ProductStock[];
}
