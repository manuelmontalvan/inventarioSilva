// lib/api/inventory.ts
import axios from '../axiosInstance';
import {
  InventoryMovement,
 CreateInventoryMovementsDto,

} from '@/types/inventory';



export const getInventoryMovements = async (): Promise<InventoryMovement[]> => {
  const { data } = await axios.get('/inventory');
  return data;
};

export const getInventoryMovementById = async (id: string): Promise<InventoryMovement> => {
  const { data } = await axios.get(`/inventory/${id}`);
  return data;
};

export const createInventoryMovement = async (
  movement: CreateInventoryMovementsDto
): Promise<InventoryMovement> => {
  const { data } = await axios.post('/inventory', movement);
  return data;
};

export const updateInventoryMovement = async (
  id: string,
  movement: Partial<CreateInventoryMovementsDto>
): Promise<InventoryMovement> => {
  const { data } = await axios.patch(`/inventory/${id}`, movement);
  return data;
};

export const deleteInventoryMovement = async (id: string): Promise<void> => {
  await axios.delete(`/inventory/${id}`);
};
export const clearInventoryMovements = async (): Promise<void> => {
  await axios.delete('/inventory/clear?confirm=YES');
};