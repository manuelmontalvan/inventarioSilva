// lib/api/inventory.ts
import axios from 'axios';
import {
  InventoryMovement,
  CreateInventoryMovementDto,
} from '@/types/inventory';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Ajusta si usas un dominio diferente
  withCredentials: true,
});

export const getInventoryMovements = async (): Promise<InventoryMovement[]> => {
  const { data } = await api.get('/inventory');
  return data;
};

export const getInventoryMovementById = async (id: string): Promise<InventoryMovement> => {
  const { data } = await api.get(`/inventory/${id}`);
  return data;
};

export const createInventoryMovement = async (
  movement: CreateInventoryMovementDto
): Promise<InventoryMovement> => {
  const { data } = await api.post('/inventory', movement);
  return data;
};

export const updateInventoryMovement = async (
  id: string,
  movement: Partial<CreateInventoryMovementDto>
): Promise<InventoryMovement> => {
  const { data } = await api.patch(`/inventory/${id}`, movement);
  return data;
};

export const deleteInventoryMovement = async (id: string): Promise<void> => {
  await api.delete(`/inventory/${id}`);
};
