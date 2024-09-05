import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from "rxjs";

import { environment } from 'src/environments/environment';
import { ICreateUser, IUpdateUser } from 'src/app/model/user/usuario';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;


  constructor(private httpClient: HttpClient) {
  }

  getUserPageable(paramsObj: any): Observable<any> {
    let params = new HttpParams;

    for (let key in paramsObj) {
      if (paramsObj.hasOwnProperty(key)) {
        params = params.set(key, paramsObj[key]);
      }
    }

    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/users`,  { params });
  }

  createUser(userObj: ICreateUser): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/api/v1/users`, userObj);
  }

  updateUser(userObj: IUpdateUser): Observable<any> {
    return this.httpClient.put(`${this.apiUrl}/api/v1/users`, userObj);
  }

  deleteUser(idUser: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/api/v1/users/${idUser}`);
  }

  getUserById(idUser: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/users/${idUser}`);
  }
}
