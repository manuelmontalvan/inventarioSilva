import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ForecastEntry {
  @IsString()
  ds: string;

  @IsNumber()
  yhat: number;
}

class Metrics {
  @IsNumber()
  MAE: number;

  @IsNumber()
  RMSE: number;
}

export class CreatePredictionDto {
  @IsString()
  product: string;

  @IsString()
  brand: string;

  @IsString()
  unit: string;

  @IsNumber()
  days: number;

  @IsString()
  tendency: string;

  @IsBoolean()
  alert_restock: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ForecastEntry)
  forecast: ForecastEntry[];

  @IsOptional()
  @ValidateNested()
  @Type(() => Metrics)
  metrics?: Metrics;
  @IsOptional()
@IsNumber()
sales_last_month?: number;

@IsOptional()
@IsNumber()
projected_sales?: number;

@IsOptional()
@IsNumber()
percent_change?: number;

}
