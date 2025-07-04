import axios from "axios";
import { PredictionResponse } from "@/types/prediction";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API || "http://localhost:3002";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const getPrediction = async (
  product_name: string,
  brand: string,
  unit: string,
  days: number = 7
): Promise<PredictionResponse> => {
  const response = await axios.get(`${PYTHON_API_BASE}/predict`, {
    params: { product_name, brand, unit, days },
    headers: {
      
      "x-api-key": API_KEY,
    
    },
  });
  return response.data;
};
