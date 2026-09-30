import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlumnoService {
  private apiUrl = 'http://localhost:8000/api/alumnos/';

  constructor(private http: HttpClient) {}

  obtenerAlumnos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  inscribirAlumno(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}
