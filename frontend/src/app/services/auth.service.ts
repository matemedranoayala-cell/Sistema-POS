import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
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
        const userRol = response.rol || 'SUPERADMIN';
        localStorage.setItem('kombat-session', JSON.stringify({ username, rol: userRol }));
        return { success: true, rol: userRol };
      }

      return { success: false };

    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        console.error('Error de autenticación:', error.error || error.message);
      } else {
        console.error('Error inesperado durante el login:', error);
      }
      return { success: false };
    }
  }

  logout(): void {
    localStorage.removeItem('kombat-session');
    localStorage.removeItem('kombat-branch');
    localStorage.removeItem('kombat-keep-session');
  }
}
