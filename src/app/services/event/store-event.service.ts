import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  IApplyDiscountRequest,
  IAssignEventProductsRequest,
  ICreateStoreEvent,
  IUpdateStoreEvent
} from 'src/app/model/event/event';

@Injectable({
  providedIn: 'root'
})
export class StoreEventService {
  private apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getPublicEvents(region: string = ''): Observable<any> {
    let params = new HttpParams();
    if (region) {
      params = params.set('region', region);
    }
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/events/public`, { params });
  }

  getPublicEventByIdOrCode(idOrCode: string, region: string = ''): Observable<any> {
    let params = new HttpParams();
    if (region) {
      params = params.set('region', region);
    }
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/events/public/${idOrCode}`, { params });
  }

  getAllEvents(region: string = ''): Observable<any> {
    let params = new HttpParams();
    if (region) {
      params = params.set('region', region);
    }
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/events`, { params });
  }

  getEventById(idOrCode: string, region: string = ''): Observable<any> {
    let params = new HttpParams();
    if (region) {
      params = params.set('region', region);
    }
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/events/${idOrCode}`, { params });
  }

  createEvent(req: ICreateStoreEvent): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/api/v1/events`, req);
  }

  updateEvent(id: string, req: IUpdateStoreEvent): Observable<any> {
    return this.httpClient.put<any>(`${this.apiUrl}/api/v1/events/${id}`, req);
  }

  deleteEvent(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.apiUrl}/api/v1/events/${id}`);
  }

  assignProductsToEvent(eventId: string, req: IAssignEventProductsRequest): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/api/v1/events/${eventId}/products`, req);
  }

  removeProductFromEvent(eventId: string, productId: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.apiUrl}/api/v1/events/${eventId}/products/${productId}`);
  }

  applyDiscount(req: IApplyDiscountRequest): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/api/v1/events/discounts/apply`, req);
  }

  removeDiscount(productId: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.apiUrl}/api/v1/events/discounts/${productId}`);
  }
}
