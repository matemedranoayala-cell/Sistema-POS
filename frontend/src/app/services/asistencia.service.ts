import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/asistencias/';

  marcarIngreso(datos: { dni?: string; alumno?: number; estado_acceso?: string }): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    return this.http.post(this.apiUrl, {
      ...datos,
      estado_acceso: datos.estado_acceso || 'Permitido',
      usuario: sesion.username,
      rol: sesion.rol
    });
  }

  obtenerAsistenciasHoy(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
