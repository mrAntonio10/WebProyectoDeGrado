import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from "rxjs";

import { environment } from 'src/environments/environment';
import { ICreateEnterprise, IUpdateEnterprise } from 'src/app/model/enterprise/enterprise';
import { ICreateWarehouse, IUpdateWarehouse, IWarehouse } from 'src/app/model/warehouse/warehouse';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private apiUrl = environment.apiUrl;


  constructor(private httpClient: HttpClient) {
  }

  getWarehousePageable(paramsObj: any): Observable<any> {
    let params = new HttpParams;

    for (let key in paramsObj) {
      if (paramsObj.hasOwnProperty(key)) {
        params = params.set(key, paramsObj[key]);
      }
    }

    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/warehouses`,  { params });
  }

  createWarehouse(warehouseObj: ICreateWarehouse): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/api/v1/warehouses`, warehouseObj);
  }

  updateWarehouse(warehouseObj: IUpdateWarehouse): Observable<any> {
    return this.httpClient.put(`${this.apiUrl}/api/v1/warehouses`, warehouseObj);
  }

  deleteWarehouse(idWarehouse: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/api/v1/warehouses/${idWarehouse}`);
  }

  getWarehouseById(idWarehouse: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/warehouses/${idWarehouse}`);
  }
}
