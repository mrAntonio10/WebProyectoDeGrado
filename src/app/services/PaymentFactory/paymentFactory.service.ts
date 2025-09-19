import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs";

import { environment } from 'src/environments/environment';
import { ICreateEnterprise, IUpdateEnterprise } from 'src/app/model/enterprise/enterprise';
import { ICreatePaymentIntegration } from 'src/app/model/paymentIntegration/paymentIntegration';
import { ICreateCharge } from 'src/app/model/PaymentFactory/paymentFactory';

@Injectable({
  providedIn: 'root'
})
export class PaymentFactoryService {
  private apiUrl = environment.apiUrl;


  constructor(private httpClient: HttpClient) {
  }

  getAuthPaymentJwt(): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/stereum/token`);
  }

  createCharge(charge: ICreateCharge): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/api/v1/stereum/create-charge`, charge);
  }
}
