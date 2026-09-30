import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private apiUrl = 'http://localhost:8000/api/ventas/';

  constructor(private http: HttpClient) {}

  registrarVenta(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}
