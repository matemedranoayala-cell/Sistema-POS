import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ProductoBajoStock {
  nombre: string;
  sku: string;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class StockBajoService {
  private http = inject(HttpClient);

  obtener(limite = 5): Observable<ProductoBajoStock[]> {
    return this.http.get<ProductoBajoStock[]>(
      `http://127.0.0.1:8000/api/productos/stock-bajo/?limite=${limite}`
    );
  }
}
