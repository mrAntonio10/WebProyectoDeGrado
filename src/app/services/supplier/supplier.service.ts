import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ICreateSupplier, IUpdateSupplier } from 'src/app/model/supplier/supplier';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getSuppliers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/v1/supplier`);
  }

  createSupplier(payload: ICreateSupplier): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/v1/supplier`, payload);
  }

  updateSupplier(payload: IUpdateSupplier): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/v1/supplier/${payload.id}`, payload);
  }

  deleteSupplier(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/v1/supplier/${id}`);
  }
}
