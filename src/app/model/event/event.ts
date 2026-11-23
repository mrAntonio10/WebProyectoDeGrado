export interface IEventProduct {
  id?: string;
  eventId?: string;
  eventName?: string;
  productId: string;
  sku: string;
  productName: string;
  category: string;
  size?: string;
  color?: string;
  gender?: string;
  brand?: string;
  region: string;
  photo?: string;
  originalPrice: number;
  discountType: 'MONTO_FIJO' | 'PORCENTUAL' | 'NONE' | string;
  discountValue: number;
  finalPrice: number;
  approvedByAdminId?: string;
  approvedByAdminName?: string;
  approvedDate?: number;
}

export interface IStoreEvent {
  id: string;
  name: string;
  code: string;
  description: string;
  isDefault: boolean;
  discountType?: 'MONTO_FIJO' | 'PORCENTUAL' | 'NONE' | string;
  discountValue?: number;
  approvedByAdminId?: string;
  approvedByAdminName?: string;
  approvedDate?: number;
  startDate?: number;
  endDate?: number;
  state: string;
  productCount?: number;
  products: IEventProduct[];
}

export interface ICreateStoreEvent {
  name: string;
  description: string;
  startDate?: number;
  endDate?: number;
  productIds: string[];
  discountType?: string;
  discountValue?: number;
}

export interface IUpdateStoreEvent {
  id?: string;
  name: string;
  description: string;
  startDate?: number;
  endDate?: number;
  productIds: string[];
  discountType?: string;
  discountValue?: number;
}

export interface IApplyDiscountRequest {
  productIds: string[];
  discountType: 'MONTO_FIJO' | 'PORCENTUAL' | string;
  discountValue: number;
}

export interface IAssignEventProductsRequest {
  productIds: string[];
  discountType?: string;
  discountValue?: number;
}
