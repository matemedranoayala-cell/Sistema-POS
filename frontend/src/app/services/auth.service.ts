import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StaffMember } from '../components/staff-selector/staff-selector.component';

export type LoginMode = 'pin' | 'pass';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly demoUsers = [
    { initials: 'CM', pin: '1234', username: 'EMP-0842', password: '12345678' },
    { initials: 'VR', pin: '5678', username: 'EMP-0910', password: 'recepcion' },
    { initials: 'CD', pin: '9012', username: 'EMP-1001', password: 'supervisor' }
  ];

  constructor(private readonly http: HttpClient) {}

  async login(
    staff: StaffMember,
    mode: LoginMode,
    pin: string,
    username: string,
    password: string
  ): Promise<boolean> {
    const user = this.demoUsers.find((item) => item.initials === staff.initials);

    if (!user) {
      return false;
    }

    const localLogin =
      mode === 'pin'
        ? user.pin === pin
        : user.username === username && user.password === password;

    const apiLogin = await firstValueFrom(
      this.http.post<{ status: string }>('/api/login/', {
        username: mode === 'pin' ? user.username : username,
        password: mode === 'pin' ? pin : password
      }).pipe(
        map((response) => response.status === 'ok'),
        catchError((error: unknown) => {
          console.warn('No se pudo contactar /api/login/. Se usa la validación demo local.', error);
          return of(localLogin);
        })
      )
    );

    const validLogin = apiLogin || localLogin;

    if (validLogin) {
      localStorage.setItem('kombat-session', JSON.stringify(staff));
    }

    return validLogin;
  }

  logout(): void {
    localStorage.removeItem('kombat-session');
  }
}
