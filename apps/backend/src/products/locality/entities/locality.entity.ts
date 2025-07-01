import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Shelf } from '../shelves/entities/shelf.entity';

@Entity()
export class Locality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Shelf, (shelf) => shelf.locality)
  shelves: Shelf[];
}
