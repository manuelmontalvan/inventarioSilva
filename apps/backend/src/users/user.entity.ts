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

  @Column({ type: 'text', nullable: true })
  refreshToken?: string | null;

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

    /*
  // --- Relaciones inversas añadidas ---

  @OneToMany(() => Product, (product) => product.createdBy)
  createdProducts: Product[]; // Productos creados por este usuario

  @OneToMany(() => Product, (product) => product.updatedBy)
  updatedProducts: Product[]; // Productos actualizados por este usuario

  @OneToMany(() => ProductPurchase, (purchase) => purchase.registeredBy)
  registeredPurchases: ProductPurchase[]; // Compras de productos registradas por este usuario

  @OneToMany(() => ProductSale, (sale) => sale.soldBy)
  soldProducts: ProductSale[]; // Ventas de productos realizadas por este usuario*/


}
