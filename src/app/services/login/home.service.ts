import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import { UsuarioLoginI } from 'src/app/model/user/usuario';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = environment.apiUrl;


  constructor(private httpClient: HttpClient) {
  }

  logInUsuario (usuario: UsuarioLoginI): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/api/v1/auth/authenticate`, usuario);
  }

}
