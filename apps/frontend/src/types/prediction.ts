export interface PredictionPoint {
  ds: string;
  yhat: number;
}

export interface PredictionResponse {
  success: boolean;
  product: string;
  brand: string;
  unit: string;
  days: number;
  tendency: string;
  alert_restock: boolean;
  forecast: PredictionPoint[];
  metrics?: {
    MAE: number;
    RMSE: number;
  };
}

export interface ForecastItem {
  ds: string; // fecha
  yhat: number; // valor predicho
  yhat_upper?: number;
  yhat_lower?: number;
}

export interface ProductForecastComparison {
  product: string;
  brand: string;
  unit: string;
  total_forecast: number;
  forecast: ForecastItem[];
}

export interface PredictionComparisonResponse {
  success: boolean;
  comparison: ProductForecastComparison[];
}

export interface ModelForecastWithMetrics {
  forecast: PredictionPoint[];
  metrics?: {
    MAE: number;
    RMSE: number;
  };
  tendency: string;
  alert_restock: boolean;
  sales_last_month: number;
  projected_sales: number;
  percent_change: number | null;
  current_quantity?: number;
}

export interface MultiModelPredictionResponse {
  success: boolean;
  product: string;
  brand: string;
  unit: string;
  days: number;
  forecasts: {
    prophet?: ModelForecastWithMetrics;
    linear?: ModelForecastWithMetrics;
    arima?: ModelForecastWithMetrics;
  };
}

export interface SummaryCardsProps {
  loading: boolean;
  totalSales: number;
  productName: string;
  days: number;
  brand: string;
  unit: string;
  percentChange?: number | null;
  multiModel?: {
    [modelName: string]: ModelForecastWithMetrics;
  };
  tendency?: string;
  alertRestock?: boolean;
  modelName?: string;
  model?: ModelForecastWithMetrics;
  currentQuantity?: number;

}
