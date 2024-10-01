import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from "rxjs";

import { environment } from 'src/environments/environment';
import { ICreateEnterprise, IUpdateEnterprise } from 'src/app/model/enterprise/enterprise';
import { ICreateProduct } from 'src/app/model/product/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;


  constructor(private httpClient: HttpClient) {
  }

  getProductPageable(paramsObj: any): Observable<any> {
    let params = new HttpParams;

    for (let key in paramsObj) {
      if (paramsObj.hasOwnProperty(key)) {
        params = params.set(key, paramsObj[key]);
      }
    }

    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/products`,  { params });
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
    return this.httpClient.get(`${this.apiUrl}/api/v1/products/list/${category}`)
  }

}
