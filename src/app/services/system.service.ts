import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private apiUrl = `${environment.apiUrl}/system`;

  constructor(private http: HttpClient) { }

  /**
   * Reset system transactional data.
   */
  resetSystem(): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, {});
  }
}
