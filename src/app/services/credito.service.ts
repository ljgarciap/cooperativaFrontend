import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Credito {
  id: number;
  identificacion: string;
  nombre: string;
  monto: number;
  tipo: string;
  estado: string;
  observaciones?: string;
  created_at: string;
  historial?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class CreditoService {
  private apiUrl = 'http://localhost:8000/api/creditos';

  constructor(private http: HttpClient) { }

  getCreditos(): Observable<Credito[]> {
    return this.http.get<Credito[]>(this.apiUrl);
  }

  uploadPdf(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // For the demo, this would hit the n8n webhook
    return this.http.post('http://localhost:5678/webhook-test/credito-pdf', formData);
  }

  // Future methods for status updates can be added here
}
