import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private apiUrl = 'http://localhost:8000/api/asistencias/';

  constructor(private http: HttpClient) {}

  marcarIngreso(datos: any): Observable<any> {

    return this.http.post(this.apiUrl, datos);
  }

  obtenerAsistenciasHoy(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
