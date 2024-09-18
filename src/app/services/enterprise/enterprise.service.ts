import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from "rxjs";

import { environment } from 'src/environments/environment';
import { ICreateEnterprise, IUpdateEnterprise } from 'src/app/model/enterprise/enterprise';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  private apiUrl = environment.apiUrl;


  constructor(private httpClient: HttpClient) {
  }

  getEnterprisePageable(paramsObj: any): Observable<any> {
    let params = new HttpParams;

    for (let key in paramsObj) {
      if (paramsObj.hasOwnProperty(key)) {
        params = params.set(key, paramsObj[key]);
      }
    }

    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/enterprises`,  { params });
  }

  createEnterprise(enterpriseObj: ICreateEnterprise): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/api/v1/enterprises`, enterpriseObj);
  }

  updateEnterprise(enterpriseObj: IUpdateEnterprise): Observable<any> {
    return this.httpClient.put(`${this.apiUrl}/api/v1/enterprises`, enterpriseObj);
  }

  deleteEnterprise(idEnterprise: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/api/v1/enterprises/${idEnterprise}`);
  }

  getEnterpriseById(idEnterprise: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/enterprises/${idEnterprise}`);
  }

  getEnterpriseListCombo(): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/enterprises/list`);
  }
}
