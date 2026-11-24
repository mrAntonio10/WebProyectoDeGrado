import { IRekidsGarment } from '../product/product';
import {
  IRekidsBranchCatalogDto,
  IRekidsSandboxBranchDto,
  IRekidsSandboxPhotoDto,
  IRekidsSandboxProductDto,
  REKIDS_BRANCH_UUIDS
} from './rekids.dto';

/**
 * Modelos de Dominio (Capa Model de MVVM) para Sucursales y Productos de ReKids.
 */
export class RekidsBranchModel {
  readonly id: string;
  readonly name: string;
  readonly region: 'LA_PAZ' | 'SANTA_CRUZ' | string;
  readonly localBranchOfficeId?: string;

  constructor(data: {
    id: string;
    name: string;
    region?: string;
    localBranchOfficeId?: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.region = data.region || RekidsBranchModel.resolveRegion(data.id, data.name);
    this.localBranchOfficeId = data.localBranchOfficeId;
  }

  get isLaPaz(): boolean {
    return this.region === 'LA_PAZ' || this.id === REKIDS_BRANCH_UUIDS.LA_PAZ;
  }

  get isSantaCruz(): boolean {
    return this.region === 'SANTA_CRUZ' || this.id === REKIDS_BRANCH_UUIDS.SANTA_CRUZ;
  }

  get cityLabel(): string {
    return this.isLaPaz ? 'La Paz' : 'Santa Cruz';
  }

  static resolveRegion(branchId?: string, branchName?: string): 'LA_PAZ' | 'SANTA_CRUZ' {
    if (branchId === REKIDS_BRANCH_UUIDS.LA_PAZ) return 'LA_PAZ';
    if (branchId === REKIDS_BRANCH_UUIDS.SANTA_CRUZ) return 'SANTA_CRUZ';
    const upper = (branchName || '').toUpperCase();
    if (upper.includes('PAZ')) return 'LA_PAZ';
    return 'SANTA_CRUZ';
  }

  static fromDto(dto: IRekidsSandboxBranchDto, localBranchOfficeId?: string): RekidsBranchModel {
    return new RekidsBranchModel({
      id: dto.id,
      name: dto.name,
      region: dto.region,
      localBranchOfficeId
    });
  }
}

export class RekidsProductModel {
  readonly id: string;
  readonly code: string;
  readonly legacyCode: string | null;
  readonly branchId: string;
  readonly branchName: string;
  readonly region: 'LA_PAZ' | 'SANTA_CRUZ' | string;
  readonly name: string;
  readonly category: string;
  readonly size: string | null;
  readonly brand: string | null;
  readonly condition: string;
  readonly priceText: string;
  readonly priceNumber: number;
  readonly currency: string;
  readonly availability: 'available' | 'unavailable';
  readonly photos: IRekidsSandboxPhotoDto[];
  readonly primaryPhotoUrl: string;
  readonly updatedAt: string;
  readonly version: number;

  constructor(dto: IRekidsSandboxProductDto, branchName?: string, region?: string) {
    this.id = dto.id;
    this.code = dto.code;
    this.legacyCode = dto.legacy_code ?? null;
    this.branchId = dto.branch_id;
    this.region = region || RekidsBranchModel.resolveRegion(dto.branch_id, branchName);
    this.branchName =
      branchName ||
      (this.region === 'LA_PAZ'
        ? 'DEMO La Paz — datos ficticios'
        : 'DEMO Santa Cruz — datos ficticios');
    this.name = dto.name;
    this.category = dto.category;
    this.size = dto.size ?? null;
    this.brand = dto.brand ?? null;
    this.condition = dto.condition;
    this.priceText = dto.price;
    this.priceNumber = Number.parseFloat(dto.price) || 0;
    this.currency = dto.currency || 'BOB';
    this.availability = dto.availability;
    this.photos = Array.isArray(dto.photos) ? dto.photos : [];
    this.primaryPhotoUrl = RekidsProductModel.resolvePhoto(dto);
    this.updatedAt = dto.updated_at;
    this.version = dto.version ?? 1;
  }

  get isAvailable(): boolean {
    return this.availability === 'available';
  }

  get stock(): number {
    return this.isAvailable ? 1 : 0;
  }

  get formattedPrice(): string {
    return `${this.priceNumber.toFixed(2)} ${this.currency}`;
  }

  static resolvePhoto(dto: IRekidsSandboxProductDto): string {
    if (Array.isArray(dto.photos) && dto.photos.length > 0) {
      const primary = dto.photos.find(p => p.primary && p.url);
      return primary ? primary.url : dto.photos[0].url;
    }
    const code = (dto.code || '').toUpperCase();
    if (code.includes('LP-001')) {
      return 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80';
    }
    if (code.includes('LP-002')) {
      return 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=600&q=80';
    }
    if (code.includes('SC-001')) {
      return 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80';
    }
    if (code.includes('SC-002')) {
      return 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80';
    }
    return 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80';
  }

  toRekidsGarment(): IRekidsGarment {
    return {
      id: this.id,
      externalId: this.id,
      sku: this.code,
      legacyCode: this.legacyCode,
      branchId: this.branchId,
      branchName: this.branchName,
      name: this.name,
      productName: this.name,
      category: this.category,
      size: this.size || 'Única',
      color: `Estado: ${this.condition}`,
      gender: 'Unisex',
      brand: this.brand || 'ReKids',
      condition: this.condition,
      currency: this.currency,
      availability: this.availability,
      purchasePrice: this.priceNumber,
      salePrice: this.priceNumber,
      unitaryCost: this.priceNumber,
      discountType: 'NONE',
      discountValue: 0,
      finalPrice: this.priceNumber,
      region: this.region,
      stock: this.stock,
      photo: this.primaryPhotoUrl,
      photos: this.photos,
      isNew: true,
      updatedAt: this.updatedAt,
      version: this.version,
      eventNames: ['Novedades']
    };
  }
}

export class RekidsBranchCatalogModel {
  readonly branch: RekidsBranchModel;
  readonly products: RekidsProductModel[];
  readonly garments: IRekidsGarment[];
  readonly totalProducts: number;
  readonly availableCount: number;
  readonly unavailableCount: number;
  readonly nextCursor: string | null;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;

  constructor(params: {
    branch: RekidsBranchModel;
    products: RekidsProductModel[];
    garments?: IRekidsGarment[];
    totalProducts?: number;
    availableCount?: number;
    unavailableCount?: number;
    nextCursor?: string | null;
    page?: number;
    limit?: number;
    totalPages?: number;
  }) {
    this.branch = params.branch;
    this.products = params.products;
    this.garments =
      params.garments && params.garments.length > 0
        ? params.garments
        : params.products.map(p => p.toRekidsGarment());
    this.totalProducts =
      params.totalProducts !== undefined ? params.totalProducts : params.products.length;
    this.availableCount =
      params.availableCount !== undefined
        ? params.availableCount
        : params.products.filter(p => p.isAvailable).length;
    this.unavailableCount =
      params.unavailableCount !== undefined
        ? params.unavailableCount
        : Math.max(0, this.totalProducts - this.availableCount);
    this.nextCursor = params.nextCursor ?? null;
    this.page = params.page ?? 0;
    this.limit = params.limit ?? 50;
    this.totalPages =
      params.totalPages ?? Math.max(1, Math.ceil(this.totalProducts / Math.max(1, this.limit)));
  }

  get availableProducts(): RekidsProductModel[] {
    return this.products.filter(p => p.isAvailable);
  }

  get unavailableProducts(): RekidsProductModel[] {
    return this.products.filter(p => !p.isAvailable);
  }

  static fromDto(dto: IRekidsBranchCatalogDto): RekidsBranchCatalogModel {
    const branch = new RekidsBranchModel({
      id: dto.branchId,
      name: dto.branchName,
      region: dto.region,
      localBranchOfficeId: dto.localBranchOfficeId
    });
    const products = (dto.sandboxProducts || []).map(
      sp => new RekidsProductModel(sp, dto.branchName, dto.region)
    );
    return new RekidsBranchCatalogModel({
      branch,
      products,
      garments: dto.garments,
      totalProducts: dto.totalProducts,
      availableCount: dto.availableCount,
      unavailableCount: dto.unavailableCount,
      nextCursor: dto.nextCursor ?? null,
      page: dto.page ?? 0,
      limit: dto.limit ?? 50,
      totalPages: dto.totalPages ?? 1
    });
  }
}
