import axios from "axios";
import { PredictionResponse , MultiModelPredictionResponse } from "@/types/prediction";

const PYTHON_API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3002"
    : "https://inventariosilva-production.up.railway.app";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const getPrediction = async (
  product_name: string,
  brand: string,
  unit: string,
  days: number = 7,
  tendency?: string,
  alert_restock?: boolean
): Promise<PredictionResponse> => {
  const response = await axios.get(`${PYTHON_API_BASE}/predict`, {
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

console.log("👉 URL:", `${PYTHON_API_BASE}/predict`);

  return response.data;
};


export const getAllModelPredictions = async (
  product_name: string,
  brand: string,
  unit: string,
  days: number = 7
): Promise<MultiModelPredictionResponse> => {
  const response = await axios.get(`${PYTHON_API_BASE}/predict/all-models`, {
    params: {
      product_name,
      brand,
      unit,
      days,
    },
    headers: {
      "x-api-key": API_KEY || "",
    },
  });

  console.log("📡 Llamando a /predict/all-models:", response.data);
  return response.data;
};

export const exportAllForecasts = async (
  data: MultiModelPredictionResponse
): Promise<void> => {
  const response = await axios.post(
    `${PYTHON_API_BASE}/predict/export-all`,
    {
      product: data.product,
      brand: data.brand,
      unit: data.unit,
      days: data.days,
      forecasts: data.forecasts,
    },
    {
      responseType: "blob", // Necesario para manejar archivos
      headers: {
        "x-api-key": API_KEY || "",
      },
    }
  );

  // Crear una URL y descargar el archivo
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filename = `forecast_${data.product}_${data.brand}_${data.unit}.xlsx`;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
