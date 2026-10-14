import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AlumnoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/alumnos/';

  obtenerAlumnos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  inscribirAlumno(datos: any): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    const payload = {
      nombre: datos.nombres || datos.nombre,
      apellidos: datos.apellidos || '',
      dni: datos.dni || '',
      telefono: datos.telefono || '',
      email: datos.email || '',
      disciplina_id: datos.disciplina || datos.disciplina_id || 'MMA',
      plan_id: Number(datos.plan || datos.plan_id || 1),
      es_competidor: Boolean(datos.esCompetidor || datos.es_competidor),
      academia_origen: datos.academiaOrigen || datos.academia_origen || 'Kombat',
      asociacion: datos.asociacion || '',
      estado: 'Activo',
      usuario: sesion.username,
      rol: sesion.rol
    };
    return this.http.post(this.apiUrl, payload);
  }
}
