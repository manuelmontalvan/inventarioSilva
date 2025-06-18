import { CreatePurchaseItemDto } from './create-purchase-item.dto';

export class CreatePurchaseOrderDto {
  supplierId: string;
  invoice_number: string;
  purchase_date: string;
  notes?: string;
  registeredById: string;
  items: CreatePurchaseItemDto[];
}
