import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PersonalService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/personal/';

  listarPersonal(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearPersonal(datos: {
    username: string;
    password: string;
    rol: string;
  }): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    return this.http.post(this.apiUrl, {
      ...datos,
      rol_creador: sesion.rol
    });
  }

  actualizarPersonal(id: number, datos: any): Observable<any> {
    const sesion = this.auth.obtenerSesion();
    return this.http.patch(`${this.apiUrl}${id}/`, {
      id,
      ...datos,
      rol_operador: sesion.rol
    });
  }
}
