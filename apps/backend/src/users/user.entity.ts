import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { IsOptional, MinLength } from 'class-validator';
import { Role } from './roles/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional()
  @Column({ unique: true })
  email: string;

  @IsOptional()
  @Column()
  @MinLength(6)
  password: string;

  @IsOptional()
  @Column()
  name: string;

  @IsOptional()
  @Column()
  lastname: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ nullable: true })
  refreshToken?: string;

  @IsOptional()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @IsOptional()
  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @IsOptional()
  @Column({ default: true })
  isActive: boolean;
  
  @IsOptional()
  @Column({ name: 'hired_date', type: 'date', nullable: true })
  hiredDate: Date;
}
