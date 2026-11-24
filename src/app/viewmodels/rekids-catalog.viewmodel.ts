import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { IRekidsGarment, ISyncGarmentsResult } from '../model/product/product';
import {
  IRekidsBranchCatalogDto,
  IRekidsProductFilterParams,
  IRekidsSandboxBranchDto,
  IRekidsSandboxProductDto,
  IRekidsSandboxProductPageResponseDto,
  REKIDS_BRANCH_UUIDS
} from '../model/rekids/rekids.dto';
import {
  RekidsBranchCatalogModel,
  RekidsBranchModel,
  RekidsProductModel
} from '../model/rekids/rekids.model';
import { ProductService } from '../services/product/product.service';

/**
 * ViewModel (Patrón MVVM) para gestionar el estado reactivo de sucursales y productos
 * de ReKids Sandbox separados por sucursal (DEMO La Paz y DEMO Santa Cruz).
 */
@Injectable({
  providedIn: 'root'
})
export class RekidsCatalogViewModel {
  private readonly branchesSubject = new BehaviorSubject<RekidsBranchModel[]>([]);
  private readonly catalogsByBranchSubject = new BehaviorSubject<RekidsBranchCatalogModel[]>([]);
  private readonly selectedBranchIdSubject = new BehaviorSubject<string>(REKIDS_BRANCH_UUIDS.SANTA_CRUZ);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly nextCursorByBranchSubject = new BehaviorSubject<Record<string, string | null>>({});

  /** Observables expuestos a la Vista (View) */
  readonly branches$: Observable<RekidsBranchModel[]> = this.branchesSubject.asObservable();
  readonly catalogsByBranch$: Observable<RekidsBranchCatalogModel[]> = this.catalogsByBranchSubject.asObservable();
  readonly selectedBranchId$: Observable<string> = this.selectedBranchIdSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();
  readonly nextCursorByBranch$: Observable<Record<string, string | null>> = this.nextCursorByBranchSubject.asObservable();

  readonly selectedBranchCatalog$: Observable<RekidsBranchCatalogModel | null> =
    this.catalogsByBranch$.pipe(
      map(catalogs => {
        const selectedId = this.selectedBranchIdSubject.getValue();
        return (
          catalogs.find(
            c => c.branch.id === selectedId || c.branch.region === selectedId
          ) ||
          catalogs[0] ||
          null
        );
      })
    );

  constructor(private readonly productService: ProductService) {}

  /**
   * Carga las sucursales autorizadas desde el FeignClient (/api/v1/products/public/rekids/branches)
   */
  loadBranches(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.productService
      .getRekidsBranches()
      .pipe(
        map(res => (res?.data || res?.items || []) as IRekidsSandboxBranchDto[]),
        map(dtos => (dtos.length > 0 ? dtos : this.getFallbackBranchDtos())),
        map(dtos => dtos.map(d => RekidsBranchModel.fromDto(d))),
        catchError(() => of(this.getFallbackBranchDtos().map(d => RekidsBranchModel.fromDto(d)))),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(branches => {
        this.branchesSubject.next(branches);
      });
  }

  /**
   * Carga todos los productos separados por sucursal desde el FeignClient
   * (/api/v1/products/public/rekids/by-branches).
   */
  loadCatalogSeparatedByBranches(region?: string): Observable<RekidsBranchCatalogModel[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.productService.getRekidsCatalogSeparatedByBranches(region).pipe(
      map(res => (res?.data || []) as IRekidsBranchCatalogDto[]),
      map(dtos => (dtos.length > 0 ? dtos : this.getFallbackBranchCatalogDtos(region))),
      map(dtos => dtos.map(dto => RekidsBranchCatalogModel.fromDto(dto))),
      catchError(() =>
        of(this.getFallbackBranchCatalogDtos(region).map(dto => RekidsBranchCatalogModel.fromDto(dto)))
      ),
      tap(catalogs => {
        this.catalogsByBranchSubject.next(catalogs);
        this.branchesSubject.next(catalogs.map(c => c.branch));
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Consulta una página de productos de una sucursal específica con soporte de next_cursor y filtros
   * (/integrations/v1/products?branch_id=UUID&cursor=...&limit=...)
   */
  loadProductsPageForBranch(
    branchId: string,
    cursor?: string | null,
    limit: number = 50,
    filters: IRekidsProductFilterParams = {}
  ): Observable<RekidsProductModel[]> {
    return this.loadBranchProductsPaginated(branchId, {
      ...filters,
      cursor: cursor ?? filters.cursor ?? null,
      limit: limit || filters.limit || 50
    }).pipe(
      map(page => {
        const items: IRekidsSandboxProductDto[] = page?.items || [];
        return items.map(item => new RekidsProductModel(item));
      })
    );
  }

  /**
   * Consulta paginada y filtrada de productos de una sucursal autorizada de ReKids Sandbox
   * devolviendo items, next_cursor y metadatos de paginación.
   */
  loadBranchProductsPaginated(
    branchId: string,
    params: IRekidsProductFilterParams = {}
  ): Observable<IRekidsSandboxProductPageResponseDto> {
    this.loadingSubject.next(true);
    const safeLimit = Math.min(100, Math.max(1, Number(params.limit || params.size || 5)));
    const safePage = Math.max(0, Number(params.page || 0));

    return this.productService
      .getRekidsProductsByBranch(branchId, {
        ...params,
        limit: safeLimit,
        page: safePage
      })
      .pipe(
        map(res => (res?.data || res) as IRekidsSandboxProductPageResponseDto),
        map(page => {
          if (!page || !Array.isArray(page.items)) {
            return this.buildFallbackPaginatedBranchResponse(branchId, {
              ...params,
              limit: safeLimit,
              page: safePage
            });
          }
          const nextCur = page.next_cursor ?? page.nextCursor ?? null;
          return {
            ...page,
            next_cursor: nextCur,
            nextCursor: nextCur,
            page: page.page ?? safePage,
            limit: page.limit ?? safeLimit,
            totalElements: page.totalElements ?? page.items.length,
            totalPages:
              page.totalPages ??
              Math.max(1, Math.ceil((page.totalElements ?? page.items.length) / safeLimit))
          };
        }),
        catchError(() =>
          of(
            this.buildFallbackPaginatedBranchResponse(branchId, {
              ...params,
              limit: safeLimit,
              page: safePage
            })
          )
        ),
        tap(page => {
          const currentCursors = { ...this.nextCursorByBranchSubject.getValue() };
          currentCursors[branchId] = page?.next_cursor ?? null;
          this.nextCursorByBranchSubject.next(currentCursors);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Consulta la ficha comercial individual de un producto por UUID
   * (GET /integrations/v1/products/{product_id})
   */
  fetchProductById(productId: string): Observable<RekidsProductModel | null> {
    this.loadingSubject.next(true);
    return this.productService.getRekidsSandboxProductById(productId).pipe(
      map(res => (res?.data || res) as IRekidsSandboxProductDto),
      map(dto => (dto && dto.id ? new RekidsProductModel(dto) : null)),
      catchError(() => {
        const found = this.getFallbackSandboxProducts().find(
          p => p.id.toLowerCase() === (productId || '').toLowerCase()
        );
        return of(found ? new RekidsProductModel(found) : null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Selecciona la sucursal activa por UUID o por código de región ('LA_PAZ' | 'SANTA_CRUZ')
   */
  selectBranch(branchIdOrRegion: string): void {
    if (branchIdOrRegion === 'LA_PAZ') {
      this.selectedBranchIdSubject.next(REKIDS_BRANCH_UUIDS.LA_PAZ);
    } else if (branchIdOrRegion === 'SANTA_CRUZ') {
      this.selectedBranchIdSubject.next(REKIDS_BRANCH_UUIDS.SANTA_CRUZ);
    } else {
      this.selectedBranchIdSubject.next(branchIdOrRegion);
    }
  }

  /**
   * Sincroniza prendas desde el FeignClient hacia la BD PostgreSQL de Render
   */
  syncGarmentsWithRenderDb(region?: string): Observable<ISyncGarmentsResult> {
    this.loadingSubject.next(true);
    return this.productService.syncGarmentsFromExternalPortal(region).pipe(
      map(res => res?.data as ISyncGarmentsResult),
      tap(() => {
        this.loadCatalogSeparatedByBranches(region).subscribe();
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getCatalogSnapshot(): RekidsBranchCatalogModel[] {
    return this.catalogsByBranchSubject.getValue();
  }

  getGarmentsByRegionSnapshot(region: string): IRekidsGarment[] {
    const catalogs = this.catalogsByBranchSubject.getValue();
    const match = catalogs.find(
      c => c.branch.region === region || c.branch.id === region
    );
    return match ? match.garments : [];
  }

  private getFallbackBranchDtos(): IRekidsSandboxBranchDto[] {
    return [
      {
        id: REKIDS_BRANCH_UUIDS.LA_PAZ,
        name: 'DEMO La Paz — datos ficticios',
        region: 'LA_PAZ'
      },
      {
        id: REKIDS_BRANCH_UUIDS.SANTA_CRUZ,
        name: 'DEMO Santa Cruz — datos ficticios',
        region: 'SANTA_CRUZ'
      }
    ];
  }

  private getFallbackSandboxProducts(): IRekidsSandboxProductDto[] {
    const nowIso = new Date().toISOString();
    return [
      {
        id: '20000000-0000-4000-8000-000000000001',
        code: 'DEMO-LP-001',
        legacy_code: 'DEMO-ANT-01',
        branch_id: REKIDS_BRANCH_UUIDS.LA_PAZ,
        name: 'DEMO Vestido azul',
        category: 'Vestidos',
        size: '6',
        brand: 'Marca ficticia',
        condition: 'Excelente',
        price: '55.00',
        currency: 'BOB',
        availability: 'available',
        photos: [],
        updated_at: nowIso,
        version: 1
      },
      {
        id: '20000000-0000-4000-8000-000000000002',
        code: 'DEMO-LP-002',
        legacy_code: 'DEMO-ANT-01',
        branch_id: REKIDS_BRANCH_UUIDS.LA_PAZ,
        name: 'DEMO Polera vendida',
        category: 'Poleras',
        size: '4',
        brand: 'Marca ficticia',
        condition: 'Bueno',
        price: '35.00',
        currency: 'BOB',
        availability: 'unavailable',
        photos: [],
        updated_at: nowIso,
        version: 1
      },
      {
        id: '20000000-0000-4000-8000-000000000003',
        code: 'DEMO-SC-001',
        legacy_code: null,
        branch_id: REKIDS_BRANCH_UUIDS.SANTA_CRUZ,
        name: 'DEMO Zapatos',
        category: 'Zapatos',
        size: '28',
        brand: null,
        condition: 'Excelente',
        price: '40.00',
        currency: 'BOB',
        availability: 'available',
        photos: [],
        updated_at: nowIso,
        version: 1
      },
      {
        id: '20000000-0000-4000-8000-000000000004',
        code: 'DEMO-SC-002',
        legacy_code: null,
        branch_id: REKIDS_BRANCH_UUIDS.SANTA_CRUZ,
        name: 'DEMO Abrigo reservado',
        category: 'Abrigos',
        size: '8',
        brand: null,
        condition: 'Bueno',
        price: '65.00',
        currency: 'BOB',
        availability: 'unavailable',
        photos: [],
        updated_at: nowIso,
        version: 1
      }
    ];
  }

  private buildFallbackPaginatedBranchResponse(
    branchId: string,
    params: IRekidsProductFilterParams
  ): IRekidsSandboxProductPageResponseDto {
    const safeLimit = Math.min(100, Math.max(1, Number(params.limit || 5)));
    const safePage = Math.max(0, Number(params.page || 0));
    const allBranch = this.getFallbackSandboxProducts().filter(p => p.branch_id === branchId);
    const availableCount = allBranch.filter(p => p.availability === 'available').length;
    const unavailableCount = allBranch.length - availableCount;

    let filtered = [...allBranch];
    if (params.category && params.category !== 'TODOS' && params.category !== 'Todas') {
      const cat = params.category.toLowerCase();
      filtered = filtered.filter(p => (p.category || '').toLowerCase().includes(cat));
    }
    if (params.clothingSize && params.clothingSize !== 'TODOS' && params.clothingSize !== 'Todas') {
      const sz = params.clothingSize.toLowerCase();
      filtered = filtered.filter(p => (p.size || '').toLowerCase() === sz);
    }
    if (params.brand && params.brand !== 'TODOS' && params.brand !== 'Todas') {
      const br = params.brand.toLowerCase();
      filtered = filtered.filter(p => (p.brand || 'ReKids').toLowerCase().includes(br));
    }
    if (params.condition && params.condition !== 'TODOS' && params.condition !== 'Todas') {
      const cond = params.condition.toLowerCase();
      filtered = filtered.filter(p => (p.condition || '').toLowerCase().includes(cond));
    }
    if (params.availability && params.availability !== 'TODOS' && params.availability !== 'Todas') {
      filtered = filtered.filter(p => p.availability === params.availability);
    }
    if (params.filter && params.filter.trim()) {
      const q = params.filter.trim().toLowerCase();
      filtered = filtered.filter(
        p =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.code || '').toLowerCase().includes(q) ||
          (p.legacy_code || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.size || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.condition || '').toLowerCase().includes(q)
      );
    }

    let working = filtered;
    if (params.cursor) {
      try {
        const decoded = JSON.parse(atob(params.cursor.replace(/-/g, '+').replace(/_/g, '/')));
        if (decoded?.after) {
          working = filtered.filter(p => p.id > decoded.after);
        }
      } catch {
        // Ignore invalid cursor in fallback
      }
    } else if (safePage > 0) {
      working = filtered.slice(safePage * safeLimit);
    }

    const items = working.slice(0, safeLimit);
    let nextCursor: string | null = null;
    if (working.length > safeLimit && items.length > 0) {
      const lastId = items[items.length - 1].id;
      nextCursor = btoa(JSON.stringify({ branch: branchId, after: lastId }))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }

    const region = branchId === REKIDS_BRANCH_UUIDS.LA_PAZ ? 'LA_PAZ' : 'SANTA_CRUZ';
    const branchName =
      region === 'LA_PAZ'
        ? 'DEMO La Paz — datos ficticios'
        : 'DEMO Santa Cruz — datos ficticios';

    return {
      items,
      next_cursor: nextCursor,
      nextCursor,
      branchId,
      branchName,
      region,
      page: safePage,
      limit: safeLimit,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / safeLimit)),
      availableCount,
      unavailableCount,
      garments: items.map(sp => new RekidsProductModel(sp, branchName, region).toRekidsGarment())
    };
  }

  private getFallbackBranchCatalogDtos(region?: string): IRekidsBranchCatalogDto[] {
    const branches = this.getFallbackBranchDtos();
    const products = this.getFallbackSandboxProducts();
    return branches
      .filter(b => !region || region === 'TODOS' || b.region === region)
      .map(b => {
        const branchProducts = products.filter(p => p.branch_id === b.id);
        const models = branchProducts.map(p => new RekidsProductModel(p, b.name, b.region));
        return {
          branchId: b.id,
          branchName: b.name,
          region: b.region || 'SANTA_CRUZ',
          totalProducts: branchProducts.length,
          availableCount: models.filter(m => m.isAvailable).length,
          unavailableCount: models.filter(m => !m.isAvailable).length,
          sandboxProducts: branchProducts,
          garments: models.map(m => m.toRekidsGarment())
        };
      });
  }
}
