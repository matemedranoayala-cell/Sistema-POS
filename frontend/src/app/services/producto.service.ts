import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = 'http://localhost:8000/api/productos/';

  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  crearProducto(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}
