import { Injectable } from '@angular/core';
import { StaffMember } from '../components/staff-selector/staff-selector.component';

export type LoginMode = 'pin' | 'pass';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly demoUsers = [
    { initials: 'CM', pin: '1234', username: 'EMP-0842', password: '12345678' },
    { initials: 'VR', pin: '5678', username: 'EMP-0910', password: 'recepcion' },
    { initials: 'CD', pin: '9012', username: 'EMP-1001', password: 'supervisor' }
  ];

  login(
    staff: StaffMember,
    mode: LoginMode,
    pin: string,
    username: string,
    password: string
  ): boolean {
    const user = this.demoUsers.find((item) => item.initials === staff.initials);

    if (!user) {
      return false;
    }

    const validLogin =
      mode === 'pin'
        ? user.pin === pin
        : user.username === username && user.password === password;

    if (validLogin) {
      localStorage.setItem('kombat-session', JSON.stringify(staff));
    }

    return validLogin;
  }

  logout(): void {
    localStorage.removeItem('kombat-session');
  }
}
