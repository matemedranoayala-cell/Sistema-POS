import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BitacoraService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/bitacora/';
  private clasesUrl = 'http://127.0.0.1:8000/api/registro-clases/';

  obtenerBitacora(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  registrarEvento(operacion: string, modulo: string, detalle: string): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    const rolLimpio = sesion.rol === 'SUPERADMIN' ? 'ADMIN' : sesion.rol;
    return this.http.post(this.apiUrl, {
      usuario: sesion.username,
      rol: rolLimpio,
      operacion: `${operacion} (${rolLimpio})`,
      modulo,
      detalle
    });
  }

  registrarFirmaClase(claseImpartida: string, totalAsistentes: number): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    return this.http.post(this.clasesUrl, {
      coach: sesion.username,
      clase_impartida: claseImpartida,
      total_asistentes: totalAsistentes
    });
  }
}
