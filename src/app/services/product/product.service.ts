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

  constructor(private httpClient: HttpClient) {
  }

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
   * Rekids 1 (Público Sin Login): Obtener prendas de las tiendas Santa Cruz / La Paz (Selecciona primero la región)
   */
  getProductsByRegion(region: string, paramsObj: any = {}): Observable<any> {
    let params = new HttpParams();
    for (let key in paramsObj) {
      if (paramsObj.hasOwnProperty(key) && paramsObj[key] !== undefined && paramsObj[key] !== null) {
        params = params.set(key, paramsObj[key]);
      }
    }
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/products/public/region/${region}`, { params });
  }

  /**
   * Rekids 2 (Público Punto de Venta Sin Login): Buscar prenda por código (SKU) en la región seleccionada
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
}
