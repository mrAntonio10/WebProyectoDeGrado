import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from "rxjs";

import { environment } from 'src/environments/environment';
import { ICreateEnterprise, IUpdateEnterprise } from 'src/app/model/enterprise/enterprise';
import { ICreatePaymentIntegration } from 'src/app/model/paymentIntegration/paymentIntegration';

@Injectable({
  providedIn: 'root'
})
export class PaymentIntegrationService {
  private apiUrl = environment.apiUrl;


  constructor(private httpClient: HttpClient) {
  }

  createPaymentIntegration(paymentIntegration: ICreatePaymentIntegration): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/api/v1/payments-integration`, paymentIntegration);
  }
}
