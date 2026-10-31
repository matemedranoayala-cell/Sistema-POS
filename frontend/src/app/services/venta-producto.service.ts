import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface VentaCarritoResponse {
  venta_id: number;
  total: number;
  metodo_pago: string;
  estado_pago: string;
  cliente_nombre: string;
  cliente_telefono: string;
  rol_cliente: string;
  vendedor: string;
  items: {
    producto_id: number;
    producto: string;
    cantidad: number;
    subtotal: number;
    stock_restante: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class VentaProductoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/ventas/producto/';

  /** Una sola venta (un ticket) con varios productos. Es atomica en el servidor. */
  venderCarrito(
    items: { producto_id: number; cantidad: number }[],
    datosVenta: {
      metodoPago: string;
      clienteNombre: string;
      telefono: string;
      rolCliente: string;
    }
  ): Observable<VentaCarritoResponse> {
    const sesion = this.auth.obtenerSesion();
    return this.http.post<VentaCarritoResponse>('http://127.0.0.1:8000/api/ventas/carrito/', {
      items,
      metodo_pago: datosVenta.metodoPago,
      usuario: sesion.username,
      cliente_nombre: datosVenta.clienteNombre,
      cliente_telefono: datosVenta.telefono,
      rol_cliente: datosVenta.rolCliente
    });
  }

  vender(productoId: number, cantidad = 1): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    return this.http.post(this.apiUrl, {
      producto_id: productoId,
      cantidad,
      usuario: sesion.username
    });
  }
}
