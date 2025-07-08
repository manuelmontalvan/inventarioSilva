import axios from "axios";
import { PredictionComparisonResponse } from "@/types/prediction";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API || "http://localhost:3002";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const compareForecasts = async (
  brand: string = "Sin marca",
  unit: string = "Sin unidad",
  days: number = 7
): Promise<PredictionComparisonResponse> => {
  const response = await axios.get(`${PYTHON_API_BASE}/compare`, {
    params: {
      brand,
      unit,
      days,
    },
    headers: {
      "x-api-key": API_KEY || "",
    },
  });

  return response.data;
};
