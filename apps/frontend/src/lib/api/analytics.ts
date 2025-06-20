import axios from 'axios';

export interface CostData {
  date: string;
  cost: number;
}

export interface ProductCostHistory {
  name: string;
  data: CostData[];
}

export async function getProductCostHistory(): Promise<ProductCostHistory[]> {
  try {
    const response = await axios.get<ProductCostHistory[]>('/analytics/product-cost-history');
    return response.data;
  } catch (error) {
    // Puedes agregar manejo de errores más detallado aquí
    throw error;
  }
}
