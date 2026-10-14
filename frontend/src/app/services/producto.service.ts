import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/productos/';

  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearProducto(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}
