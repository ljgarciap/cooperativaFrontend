import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Conciliacion {
  id: number;
  banco: string;
  mes: string;
  anio: string;
  saldo_banco: number;
  saldo_contable: number;
  estado: string;
  extracto_items?: any[];
  auxiliar_items?: any[];
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConciliacionService {
  private apiUrl = 'http://localhost:8000/api/conciliaciones';

  constructor(private http: HttpClient) { }

  getConciliaciones(): Observable<Conciliacion[]> {
    return this.http.get<Conciliacion[]>(this.apiUrl);
  }

  getConciliacion(id: number): Observable<Conciliacion> {
    return this.http.get<Conciliacion>(`${this.apiUrl}/${id}`);
  }

  uploadExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // For the demo, this would hit the n8n webhook
    return this.http.post('http://localhost:5678/webhook-test/conciliacion-excel', formData);
  }
}
