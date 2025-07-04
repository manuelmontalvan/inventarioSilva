
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