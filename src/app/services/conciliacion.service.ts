import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Conciliacion {
  id: number;
  banco: string;
  mes: string;
  anio: number;
  saldo_banco: number;
  saldo_contable: number;
  estado: string;
  created_at: string;
  extracto_items?: ExtractoItem[];
  auxiliar_items?: AuxiliarItem[];
}

export interface ExtractoItem {
  id: number;
  fecha: string;
  descripcion: string;
  referencia: string;
  valor: number;
  conciliado: boolean;
}

export interface AuxiliarItem {
  id: number;
  fecha: string;
  identificacion: string;
  descripcion: string;
  referencia: string;
  valor: number;
  conciliado: boolean;
}

export interface Bitacora {
  id: number;
  nombre_archivo: string;
  tipo_archivo: string;
  proceso: string;
  estado: string;
  detalles: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConciliacionService {
  private apiUrl = `${environment.apiUrl}/conciliaciones`;
  private bitacoraUrl = `${environment.apiUrl}/bitacora`;
  private proxyUrl = `${environment.apiUrl}/proxy-n8n/excel`;

  constructor(private http: HttpClient) { }

  getConciliaciones(): Observable<Conciliacion[]> {
    return this.http.get<Conciliacion[]>(this.apiUrl);
  }

  getConciliacion(id: number): Observable<Conciliacion> {
    return this.http.get<Conciliacion>(`${this.apiUrl}/${id}`);
  }

  getBitacora(): Observable<Bitacora[]> {
    return this.http.get<Bitacora[]>(this.bitacoraUrl);
  }

  uploadExcel(file: File, params: any): Observable<any> {
    const formData = new FormData();
    formData.append('data', file);
    formData.append('nombre_archivo', file.name);
    formData.append('banco', params.banco);
    formData.append('mes', params.mes);
    formData.append('anio', params.anio);
    formData.append('fuente', params.fuente);
    return this.http.post(this.proxyUrl, formData);
  }

  runReconciliation(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/run`, {});
  }
}
