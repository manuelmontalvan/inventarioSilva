// src/pages/entities/page.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { Role } from '../../users/roles/entities/role.entity';

@Entity()
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  path: string;

  @ManyToMany(() => Role, (role) => role.pages)
  roles: Role[];
}
