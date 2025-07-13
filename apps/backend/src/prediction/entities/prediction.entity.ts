import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  product: string;

  @Column()
  brand: string;

  @Column()
  unit: string;

  @Column()
  days: number;

  @Column()
  tendency: string;

  @Column({ default: false })
  alert_restock: boolean;

  // JSON con array de forecast {ds, yhat}
  @Column({ type: 'jsonb' })
  forecast: { ds: string; yhat: number }[];

  // JSON con métricas {MAE, RMSE}
  @Column({ type: 'jsonb', nullable: true })
  metrics?: { MAE: number; RMSE: number };

  @CreateDateColumn()
  createdAt: Date;
  @Column({ type: 'float', nullable: true })
sales_last_month?: number;

@Column({ type: 'float', nullable: true })
projected_sales?: number;

@Column({ type: 'float', nullable: true })
percent_change?: number;

}
