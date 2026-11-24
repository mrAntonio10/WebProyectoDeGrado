import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { IUpdateEnterprise } from 'src/app/model/enterprise/enterprise';
import { ICreateProduct } from 'src/app/model/product/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getProductPageable(paramsObj: any): Observable<any> {
    let params = new HttpParams();

    for (let key in paramsObj) {
      if (paramsObj.hasOwnProperty(key) && paramsObj[key] !== undefined && paramsObj[key] !== null) {
        params = params.set(key, paramsObj[key]);
      }
    }

    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/products`, { params });
  }

  createProduct(productObj: ICreateProduct): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/api/v1/products`, productObj);
  }

  updateProduct(productObj: IUpdateEnterprise): Observable<any> {
    return this.httpClient.put(`${this.apiUrl}/api/v1/products`, productObj);
  }

  deleteProduct(idProduct: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/api/v1/products/${idProduct}`);
  }

  getProductListByCategory(category: String): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/api/v1/products/list/${category}`);
  }

  getProductWithImagePageable(paramsObj: any): Observable<any> {
    let params = new HttpParams();

    for (let key in paramsObj) {
      if (paramsObj.hasOwnProperty(key) && paramsObj[key] !== undefined && paramsObj[key] !== null) {
        params = params.set(key, paramsObj[key]);
      }
    }

    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/products/with-images`, { params });
  }

  /**
   * Rekids 1 (Público Sin Login): Obtener prendas paginadas y filtradas de las tiendas Santa Cruz / La Paz (o TODOS)
   */
  getProductsByRegion(region: string, paramsObj: any = {}): Observable<any> {
    let params = new HttpParams();
    for (let key in paramsObj) {
      if (
        paramsObj.hasOwnProperty(key) &&
        paramsObj[key] !== undefined &&
        paramsObj[key] !== null &&
        String(paramsObj[key]).trim() !== ''
      ) {
        params = params.set(key, String(paramsObj[key]).trim());
      }
    }
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/products/public/region/${encodeURIComponent(region)}`, { params });
  }

  /**
   * Rekids 2 (Público Punto de Venta Sin Login): Buscar prenda por código (SKU o legacy_code) en la región seleccionada
   */
  getProductByCodeAndRegion(region: string, code: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/products/by-code/${region}/${encodeURIComponent(code.trim())}`);
  }

  /**
   * Rekids 3 (Admin): SINCRONIZAR prendas desde el portal externo (FeignClient) hacia nuestro sistema
   */
  syncGarmentsFromExternalPortal(region?: string, garments?: any[]): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/api/v1/products/sync`, {
      region: region || null,
      garments: garments || null
    });
  }

  /**
   * ReKids Sandbox 4 (FeignClient): Listar sucursales autorizadas (/integrations/v1/branches)
   */
  getRekidsBranches(): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/products/public/rekids/branches`);
  }

  /**
   * ReKids Sandbox 5 (FeignClient): Listar productos de una sucursal específica con cursor, paginación y filtros
   * (/integrations/v1/products?branch_id=UUID&cursor=...&limit=...)
   */
  getRekidsProductsByBranch(
    branchId: string,
    cursorOrParams?: string | null | Record<string, any>,
    limit: number = 50
  ): Observable<any> {
    let params = new HttpParams();
    if (cursorOrParams && typeof cursorOrParams === 'object') {
      const opts = cursorOrParams as Record<string, any>;
      const safeLimit = opts.limit !== undefined && opts.limit !== null ? Number(opts.limit) : limit;
      params = params.set('limit', String(Math.min(100, Math.max(1, safeLimit))));
      for (const key of ['cursor', 'page', 'filter', 'category', 'clothingSize', 'brand', 'condition', 'availability']) {
        if (opts[key] !== undefined && opts[key] !== null && String(opts[key]).trim() !== '') {
          params = params.set(key, String(opts[key]).trim());
        }
      }
    } else {
      params = params.set('limit', String(Math.min(100, Math.max(1, limit))));
      if (typeof cursorOrParams === 'string' && cursorOrParams.trim() !== '') {
        params = params.set('cursor', cursorOrParams.trim());
      }
    }
    return this.httpClient.get<any>(
      `${this.apiUrl}/api/v1/products/public/rekids/branches/${encodeURIComponent(branchId)}/products`,
      { params }
    );
  }

  /**
   * ReKids Sandbox 6 (FeignClient): Obtener todo el catálogo separado por sucursales
   * (DEMO La Paz y DEMO Santa Cruz)
   */
  getRekidsCatalogSeparatedByBranches(region?: string): Observable<any> {
    let params = new HttpParams();
    if (region && region !== 'TODOS') {
      params = params.set('region', region);
    }
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/products/public/rekids/by-branches`, { params });
  }

  /**
   * ReKids Sandbox 7 (FeignClient): Consultar ficha de producto por UUID (/integrations/v1/products/{productId})
   */
  getRekidsSandboxProductById(productId: string): Observable<any> {
    return this.httpClient.get<any>(
      `${this.apiUrl}/api/v1/products/public/rekids/products/${encodeURIComponent(productId)}`
    );
  }
}
