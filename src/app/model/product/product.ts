import { IRekidsSandboxPhotoDto } from '../rekids/rekids.dto';

export interface ICreateProduct {
  name: string;
  category: string;
  beverageFormat: string;
  photo?: string;
}

export interface IProductList {
  id: string;
  name: string;
  category: string;
}

export interface IProduct {
  id: string;
  name: string;
  category: string;
  beverageFormat: string;
  state: boolean;
  sku: string;
  photo?: string;
  size?: string;
  color?: string;
  gender?: string;
  brand?: string;
  purchasePrice?: number;
  salePrice?: number;
  region?: string;
  externalId?: string;
  discountType?: string;
  discountValue?: number;
  finalPrice?: number;
  discountApprovedBy?: string;
  discountApprovedDate?: number;
  isNew?: boolean;
  lastSyncDate?: number;
  stock?: number;
  unitaryCost?: number;
  eventNames?: string[];
  legacyCode?: string | null;
  branchId?: string;
  branchName?: string;
  condition?: string;
  currency?: string;
  availability?: 'available' | 'unavailable' | string;
  photos?: IRekidsSandboxPhotoDto[];
  updatedAt?: string;
  version?: number;
}

export interface IRekidsGarment {
  id: string;
  externalId?: string;
  sku: string;
  legacyCode?: string | null;
  branchId?: string;
  branchName?: string;
  name: string;
  productName?: string;
  category: string;
  size: string;
  color: string;
  gender: string;
  brand: string;
  condition?: string;
  currency?: string;
  availability?: 'available' | 'unavailable' | string;
  purchasePrice?: number;
  salePrice: number;
  unitaryCost: number;
  discountType?: 'MONTO_FIJO' | 'PORCENTUAL' | 'NONE' | string;
  discountValue?: number;
  finalPrice: number;
  discountApprovedBy?: string;
  discountApprovedDate?: number;
  region: 'SANTA_CRUZ' | 'LA_PAZ' | string;
  stock: number;
  photo?: string;
  photos?: IRekidsSandboxPhotoDto[];
  isNew?: boolean;
  updatedAt?: string;
  version?: number;
  eventNames?: string[];
}

export interface ISyncGarmentsResult {
  totalFetched: number;
  createdCount: number;
  updatedCount: number;
  addedToNovedadesCount: number;
  syncedByAdmin: string;
  syncTimestamp: number;
  source: string;
  garments: IRekidsGarment[];
}

export interface IProductPage {
  id: string;
  name: string;
  category: string;
}
