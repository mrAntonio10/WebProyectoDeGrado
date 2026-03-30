import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DomainService {
    private apiUrl = environment.apiUrl;

    constructor(private httpClient: HttpClient) { }

    checkDomainValueUsage(idDomain: string): Observable<any> {
        return this.httpClient.get<any>(`${this.apiUrl}/api/v1/domains/${idDomain}/check-usage`);
    }

    getMasterDomains(): Observable<any> {
        return this.httpClient.get<any>(`${this.apiUrl}/api/v1/domains/master`);
    }

    getDomainValues(domainName: string): Observable<any> {
        return this.httpClient.get<any>(`${this.apiUrl}/api/v1/domains/${domainName}`);
    }

    createDomainValue(domainObj: any): Observable<any> {
        return this.httpClient.post<any>(`${this.apiUrl}/api/v1/domains`, domainObj);
    }

    updateDomainValue(id: string, domainObj: any): Observable<any> {
        return this.httpClient.put<any>(`${this.apiUrl}/api/v1/domains/${id}`, domainObj);
    }

    deleteDomainValue(id: string): Observable<any> {
        return this.httpClient.delete<any>(`${this.apiUrl}/api/v1/domains/${id}`);
    }
}
