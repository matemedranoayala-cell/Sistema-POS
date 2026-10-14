import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CierreCajaService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/cierre-caja/';

  obtenerCierres(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  registrarCierre(datos: { total_ingresos: number; observaciones?: string }): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    return this.http.post(this.apiUrl, {
      ...datos,
      usuario: sesion.username,
      rol: sesion.rol
    });
  }
}
