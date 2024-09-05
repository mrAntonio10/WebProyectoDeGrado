import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = environment.apiUrl;


  constructor(private httpClient: HttpClient) {
  }

  getPermissionsByRol(idRol: string): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/api/v1/permissions`, idRol);
  }

  getPermissionsByResourceUrl(url: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/permissions${url}`);
  }

}
