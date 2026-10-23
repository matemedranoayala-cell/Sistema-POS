import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class VentaProductoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/ventas/producto/';

  vender(productoId: number, cantidad = 1): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    return this.http.post(this.apiUrl, {
      producto_id: productoId,
      cantidad,
      usuario: sesion.username
    });
  }
}
