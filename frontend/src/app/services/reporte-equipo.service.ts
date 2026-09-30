import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReporteEquipoService {
  private apiUrl = 'http://localhost:8000/api/reportes-equipo/';

  constructor(private http: HttpClient) {}

  enviarReporte(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}
