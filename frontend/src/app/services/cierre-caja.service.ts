import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CierreCajaService {
  private apiUrl = 'http://localhost:8000/api/cierre-caja/';

  constructor(private http: HttpClient) {}

  registrarCierre(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}
