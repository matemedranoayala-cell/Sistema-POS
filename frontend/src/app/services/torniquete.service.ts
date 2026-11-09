import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TorniqueteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/asistencias/';

  obtenerAsistencias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  registrarIngreso(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  filtrarAlumnos(asistencias: any[], criterio: 'dni' | 'nombre' | 'vencerse' | null, termino: string): any[] {
    if (!asistencias || asistencias.length === 0) return [];
    if (!criterio) return asistencias.slice(0, 3);

    let lista = [...asistencias];

    if (criterio === 'vencerse') {
      lista = lista.filter(a => a.clases_restantes <= 2);
    }

    const query = termino.toLowerCase().trim();
    if (!query) {
      return criterio === 'vencerse' ? lista : lista.slice(0, 3);
    }

    return lista.filter(a => {
      if (criterio === 'dni') return String(a.dni || '').toLowerCase().includes(query);
      if (criterio === 'nombre') return String(a.nombre || '').toLowerCase().includes(query);
      if (criterio === 'vencerse') {
        return String(a.dni || '').toLowerCase().includes(query) || String(a.nombre || '').toLowerCase().includes(query);
      }
      return true;
    });
  }
}
