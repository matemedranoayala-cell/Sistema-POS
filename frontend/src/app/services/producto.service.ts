import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/productos/';

  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /** Usa { stock } para fijar el conteo fisico, o { incremento } para reponer. */
  ajustarStock(
    productoId: number,
    cambio: { stock: number } | { incremento: number }
  ): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    return this.http.post(`${this.apiUrl}${productoId}/stock/`, {
      ...cambio,
      usuario: sesion.username
    });
  }

  crearProducto(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}
