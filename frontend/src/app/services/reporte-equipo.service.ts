import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ReporteEquipoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/reportes-equipo/';

  obtenerReportes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  enviarReporte(datos: {
    equipo: string;
    estado_danio?: string;
    descripcion: string;
  }): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    return this.http.post(this.apiUrl, {
      equipo: datos.equipo,
      estado_danio: datos.estado_danio || 'Reportado',
      descripcion: datos.descripcion,
      usuario: sesion.username,
      rol: sesion.rol
    });
  }
}
