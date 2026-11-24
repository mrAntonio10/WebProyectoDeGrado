import { IRekidsGarment } from '../product/product';

/**
 * DTOs oficiales de ReKids API Sandbox v0.3.0 (openapi.json)
 * consumidos a través del FeignClient del Backend Java.
 */
export const REKIDS_BRANCH_UUIDS = {
  LA_PAZ: '10000000-0000-4000-8000-000000000001',
  SANTA_CRUZ: '10000000-0000-4000-8000-000000000002',
  CONTROL_UNAUTHORIZED: '10000000-0000-4000-8000-000000000003'
} as const;

export interface IRekidsSandboxBranchDto {
  id: string;
  name: string;
  region?: 'LA_PAZ' | 'SANTA_CRUZ' | string;
}

export interface IRekidsSandboxPhotoDto {
  id: string;
  url: string;
  primary: boolean;
}

export interface IRekidsSandboxProductDto {
  id: string;
  code: string;
  legacy_code: string | null;
  branch_id: string;
  name: string;
  category: string;
  size: string | null;
  brand: string | null;
  condition: string;
  price: string; // Decimal string pattern ^[0-9]+\.[0-9]{2}$ e.g. "55.00"
  currency: 'BOB' | string;
  availability: 'available' | 'unavailable';
  photos: IRekidsSandboxPhotoDto[];
  updated_at: string; // ISO-8601 UTC
  version: number;
}

export interface IRekidsSandboxBranchListResponseDto {
  items: IRekidsSandboxBranchDto[];
}

export interface IRekidsProductFilterParams {
  branchId?: string;
  region?: string;
  eventId?: string;
  category?: string;
  clothingSize?: string;
  brand?: string;
  condition?: string;
  availability?: 'available' | 'unavailable' | '' | string;
  filter?: string;
  cursor?: string | null;
  limit?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC' | string;
}

export interface IRekidsSandboxProductPageResponseDto {
  items: IRekidsSandboxProductDto[];
  next_cursor: string | null;
  nextCursor?: string | null;
  branchId?: string;
  branchName?: string;
  region?: 'LA_PAZ' | 'SANTA_CRUZ' | string;
  page?: number;
  limit?: number;
  totalElements?: number;
  totalPages?: number;
  availableCount?: number;
  unavailableCount?: number;
  garments?: IRekidsGarment[];
}

export interface IRekidsBranchCatalogDto {
  branchId: string;
  branchName: string;
  localBranchOfficeId?: string;
  region: 'LA_PAZ' | 'SANTA_CRUZ' | string;
  totalProducts: number;
  availableCount: number;
  unavailableCount: number;
  nextCursor?: string | null;
  page?: number;
  limit?: number;
  totalPages?: number;
  sandboxProducts: IRekidsSandboxProductDto[];
  garments: IRekidsGarment[];
}

export interface IRekidsSandboxErrorDto {
  code: 'INVALID_REQUEST' | 'UNAUTHORIZED' | 'SCOPE_DENIED' | 'NOT_FOUND' | 'METHOD_NOT_ALLOWED' | 'RATE_LIMITED' | 'INTEGRATION_NOT_ENABLED' | 'TEMPORARILY_UNAVAILABLE' | string;
  message: string;
  request_id: string;
}
