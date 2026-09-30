import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RenovacionService {
  private apiUrl = 'http://localhost:8000/api/pagos/';

  constructor(private http: HttpClient) {}

  registrarRenovacion(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}
