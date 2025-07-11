import axios from "axios";
import { PredictionResponse } from "@/types/prediction";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API ;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const getPrediction = async (
  product_name: string,
  brand: string,
  unit: string,
  days: number = 7,
  tendency?: string,
  alert_restock?: boolean
): Promise<PredictionResponse> => {
  const response = await axios.get(`/predict`, {
    params: {
      product_name,
      brand,
      unit,
      days,
      ...(tendency !== undefined && { tendency }),
      ...(alert_restock !== undefined && { alert_restock }),
    },
    headers: {
      "x-api-key": API_KEY || "",
    },
  });

  return response.data;
};


/*${PYTHON_API_BASE}*/