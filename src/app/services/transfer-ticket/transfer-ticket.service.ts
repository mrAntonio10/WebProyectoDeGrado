import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ICreateTransferTicket, ITicketEvent } from '../../model/transfer-ticket/transfer-ticket';

@Injectable({
  providedIn: 'root'
})
export class TransferTicketService {
  private apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  // 1. Obtener listado de tickets (puede ser paginado o con filtros)
  getTransferTickets(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.append('page', params.page);
      if (params.size !== undefined) httpParams = httpParams.append('size', params.size);
      if (params.status) httpParams = httpParams.append('status', params.status);
      if (params.sourceId) httpParams = httpParams.append('sourceId', params.sourceId);
      if (params.destinationId) httpParams = httpParams.append('destinationId', params.destinationId);
    }
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/transfer-tickets`, { params: httpParams });
  }

  // 2. Obtener un ticket específico por su ID (incluirá details y events)
  getTransferTicketById(id: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/api/v1/transfer-tickets/${id}`);
  }

  // 3. Crear una nueva orden de transferencia (El abastecedor o central empaca el lote)
  createTransferTicket(data: ICreateTransferTicket): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/api/v1/transfer-tickets`, data);
  }

  // 4. Actualizar estado (Esto creará internamente el TicketEvent en Backend)
  // Payload incluiría: { statusChange: 'ACCEPTED', comments: 'Todo ok', details: [{productId: 'xxx', quantityDamaged: 0, quantityReceived: 10}] }
  updateTicketStatus(ticketId: string, eventData: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/api/v1/transfer-tickets/${ticketId}/events`, eventData);
  }
}
