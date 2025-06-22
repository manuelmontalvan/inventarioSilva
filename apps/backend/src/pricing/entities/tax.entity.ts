import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Tax {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('float')
  rate: number; // Porcentaje
}
