import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/ventas/';

  obtenerVentas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obtenerDetalles(): Observable<any[]> {
    return this.http.get<any[]>('http://127.0.0.1:8000/api/detalle-ventas/');
  }

  registrarVenta(datos: { total: number; metodo_pago: string; concepto?: string }): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    return this.http.post(this.apiUrl, {
      ...datos,
      usuario: sesion.username,
      rol: sesion.rol
    });
  }
}
