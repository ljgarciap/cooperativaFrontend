import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Credito {
  id: number;
  identificacion: string;
  nombre: string;
  monto: number;
  tipo: string;
  estado: string;
  observaciones?: string;
  url_archivo?: string;
  created_at: string;
  historial?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class CreditoService {
  private apiUrl = `${environment.apiUrl}/creditos`;
  private proxyUrl = `${environment.apiUrl}/proxy-n8n/pdf`;

  constructor(private http: HttpClient) { }

  getCreditos(): Observable<Credito[]> {
    return this.http.get<Credito[]>(this.apiUrl);
  }

  uploadPdf(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('data', file);
    formData.append('nombre_archivo', file.name);
    return this.http.post(this.proxyUrl, formData);
  }

  updateCredito(id: number, data: Partial<Credito>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCredito(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getFileUrl(url: string | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${environment.storageUrl}${url}`;
  }
}
