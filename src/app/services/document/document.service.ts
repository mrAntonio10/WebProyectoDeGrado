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

  createDocument(documentObj: ICreateDocument): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/api/v1/documents`, documentObj);
  }

}
