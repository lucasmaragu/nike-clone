import { Purchase } from './purchase';
import { PurchaseItem } from './purchaseItem';
export interface PurchaseWithItems extends Purchase {
    items: PurchaseItem[];
  }