export class CreatePurchaseItemDto {
  productId: string;
  supplierId: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  purchase_date: string;
  invoice_number: string;
  notes?: string;
}
