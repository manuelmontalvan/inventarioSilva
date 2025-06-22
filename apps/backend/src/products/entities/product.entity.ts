// src/products/entities/product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { UnitOfMeasure } from './unit-of-measure.entity';
import { ProductSale } from '../../productSales/entities/product-sale.entity';
import { ProductPurchase } from '../../productPurchase/entities/product-purchase.entity';
import { User } from '../../users/user.entity';
import { Locality } from '../locality/locality.entity';
import { ProductCostHistory } from '../../productPurchase/entities/product-cost-history.entity';
import { InventoryMovement } from '../../Inventory/inventory-movement.entity';
import { ProductStock } from '../product-stock/product-stock.entity';
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => InventoryMovement, (movement) => movement.product)
  inventoryMovements: InventoryMovement[];

  @Column()
  categoryId: string;

  @ManyToOne(() => Brand, (brand) => brand.products, { eager: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column()
  brandId: string;

  @ManyToOne(() => Locality, { eager: true, nullable: true })
  @JoinColumn({ name: 'localityId' })
  locality?: Locality;

  @Column({ nullable: true })
  localityId?: string;

  @OneToMany(() => ProductStock, (stock) => stock.product)
  stocks: ProductStock[];

  @Column({ nullable: true })
  @Index()
  internal_code?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'float', default: 0 })
  current_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  min_stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  max_stock: number;

  @OneToMany(() => ProductCostHistory, (costHistory) => costHistory.product)
  costHistories: ProductCostHistory[];

  @ManyToOne(() => UnitOfMeasure, (unit) => unit.products, { eager: true })
  @JoinColumn({ name: 'unitOfMeasureId' })
  unit_of_measure: UnitOfMeasure;

  @Column()
  unitOfMeasureId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchase_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sale_price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  profit_margin: number;

  @CreateDateColumn()
  entry_date: Date;

  @UpdateDateColumn()
  last_updated: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_purchase_date?: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_sale_date?: Date;

  @Column({ type: 'int', default: 0 })
  sales_frequency: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPerishable: boolean;

  @Column({ type: 'date', nullable: true })
  expiration_date?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => ProductSale, (sale) => sale.product)
  sales_history: ProductSale[];

  @OneToMany(() => ProductPurchase, (purchase) => purchase.product)
  purchase_history: ProductPurchase[];

  @Column({
    type: 'enum',
    enum: ['growing', 'declining', 'stable'],
    nullable: true,
  })
  current_trend?: 'growing' | 'declining' | 'stable';

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy?: User;

  @Column()
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ nullable: true })
  updatedById?: string;
}
