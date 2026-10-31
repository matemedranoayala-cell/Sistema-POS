import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  async login(username: string, password: string): Promise<{ success: boolean, rol?: string }> {
    try {
      const payload = JSON.stringify({ username, password });
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const response = await firstValueFrom(
        this.http.post<any>('http://127.0.0.1:8000/api/login/', payload, { headers })
      );

      if (response && response.status === 'ok') {
        const userRol = typeof response.rol === 'string'
          ? response.rol.trim().toLowerCase()
          : '';
        if (!userRol) {
          return { success: true };
        }
        localStorage.setItem('kombat-session', JSON.stringify({ username, rol: userRol }));
        localStorage.setItem('username', username);
        localStorage.setItem('rol', userRol.toUpperCase());
        return { success: true, rol: userRol };
      }

      return { success: false };
    } catch (error) {
      return { success: false };
    }
  }

  obtenerSesion(): { username: string; rol: string } {
    const raw = localStorage.getItem('kombat-session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          username: parsed.username || 'admin',
          rol: (parsed.rol || 'ADMIN').toUpperCase()
        };
      } catch {}
    }
    return {
      username: localStorage.getItem('username') || 'admin',
      rol: (localStorage.getItem('rol') || 'ADMIN').toUpperCase()
    };
  }

  logout(): void {
    localStorage.removeItem('kombat-session');
    localStorage.removeItem('kombat-branch');
    localStorage.removeItem('kombat-keep-session');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
  }
}
