import axios from 'axios';

interface Params {
  productIds: string[];
  startDate: string;
  endDate: string;
}

export interface CostData {
  date: string;
  cost: number;
}

export interface ProductCostHistory {
  name: string;
  data: CostData[];
}

export async function getProductCostHistory(params: Params): Promise<ProductCostHistory[]> {
  try {
    // Convertir productIds array a string separado por comas para la query
    const productIdsQuery = params.productIds.join(',');

    const response = await axios.get<ProductCostHistory[]>('http://localhost:3001/api/analytics/product-cost-history', {
      params: {
        productIds: productIdsQuery,
        startDate: params.startDate,
        endDate: params.endDate,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener historial de costos:", error);
    throw error;
  }
}
