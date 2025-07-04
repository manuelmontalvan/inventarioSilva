import axios from "axios";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API || "http://localhost:3002";

export interface Prediction {
  ds: string;     // fecha
  yhat: number;   // valor predicho
}

export const getPrediction = async (
  product_name: string,
  brand: string,
  unit: string,
  days: number = 7
): Promise<Prediction[]> => {
  const response = await axios.get(`${PYTHON_API_BASE}/predict`, {
    params: { product_name, brand, unit, days },
  });
  return response.data.forecast;  // <-- Aquí devuelves solo el array
};
