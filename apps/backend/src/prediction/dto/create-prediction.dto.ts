export class CreatePredictionDto {
  product: string;
  brand: string;
  unit: string;
  days: number;
  tendency: string;
  alert_restock: boolean;
  forecast: { ds: string; yhat: number }[];
  metrics?: { MAE: number; RMSE: number };
}
