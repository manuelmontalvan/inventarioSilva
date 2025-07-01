import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../user.entity';
import { Page } from '../../../page/entities/page.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @ManyToMany(() => Page, page => page.roles, { cascade: true })
  @JoinTable()
  pages: Page[];
}
