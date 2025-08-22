import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from "rxjs";

import { environment } from 'src/environments/environment';
import { ICreateEnterprise, IUpdateEnterprise } from 'src/app/model/enterprise/enterprise';
import { ICreateDocument } from 'src/app/model/document/document';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = environment.apiUrl;


  constructor(private httpClient: HttpClient) {
  }

  getSalesUserDocumentPageable(paramsObj: any): Observable<any> {
    let params = new HttpParams;

    for (let key in paramsObj) {
      if (paramsObj.hasOwnProperty(key)) {
        params = params.set(key, paramsObj[key]);
      }
    }

    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/documents`,  { params });
  }

  createDocument(documentObj: ICreateDocument): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/api/v1/documents`, documentObj);
  }

  getSalesDocumentInfotByIdDocument(idDocument: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/documents/${idDocument}`);
  }

  deleteSalesDocumentByIdDocument(idDocument: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.apiUrl}/api/v1/documents/delete/${idDocument}`);
  }

}
