import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type CriterioBusqueda = 'ci' | 'nombre';

export interface AlumnoEncontrado {
  id: number;
  nombre: string;
  dni: string;
  plan_id: number | null;
  academia: string;
  estado: string;
  vencimiento_membresia: string | null;
  membresia_vigente: boolean;
}

@Injectable({ providedIn: 'root' })
export class BusquedaAlumnosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/alumnos/buscar/';

  buscar(criterio: CriterioBusqueda, termino: string): Observable<AlumnoEncontrado[]> {
    const params = new HttpParams().set('criterio', criterio).set('q', termino.trim());
    return this.http.get<AlumnoEncontrado[]>(this.apiUrl, { params });
  }
}
