
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
  }
}

export interface ForecastItem {
  ds: string;         // fecha
  yhat: number;       // valor predicho
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
