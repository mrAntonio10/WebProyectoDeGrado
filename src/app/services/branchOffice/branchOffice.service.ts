import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from "rxjs";

import { environment } from 'src/environments/environment';
import { ICreateBranchOffice } from 'src/app/model/branchOffice/branchOffice';

@Injectable({
  providedIn: 'root'
})
export class BranchOfficeService {
  private apiUrl = environment.apiUrl;


  constructor(private httpClient: HttpClient) {
  }

  getBranchOfficePageable(paramsObj: any): Observable<any> {
    let params = new HttpParams;

    for (let key in paramsObj) {
      if (paramsObj.hasOwnProperty(key)) {
        params = params.set(key, paramsObj[key]);
      }
    }

    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/branch-offices`,  { params });
  }

  createBranchOffice(branchOfficeObj: ICreateBranchOffice): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/api/v1/branch-offices`, branchOfficeObj);
  }

  deleteBranchOffice(idBranchOffice: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/api/v1/branch-offices/${idBranchOffice}`);
  }

  getBranchOfficeseById(idBranchOffice: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/branch-offices/${idBranchOffice}`);
  }
}
