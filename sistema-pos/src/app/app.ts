import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  enteredPin = '';
  authMode: 'pin' | 'pass' = 'pin';
  passwordVisible = false;
  loginMessage = '';
  loginSuccess = false;

  selectedStaff = {
    name: 'Carlos Mendoza',
    role: 'Cajero Matutino',
    initials: 'CM'
  };

  staff = [
    { name: 'Carlos Mendoza', shortName: 'Carlos M.', role: 'Cajero Matutino', schedule: '06:00 - 14:00', initials: 'CM' },
    { name: 'Valeria Ramos', shortName: 'Valeria R.', role: 'Recepción Senior', schedule: 'Recepción', initials: 'VR' },
    { name: 'Coach David', shortName: 'Coach David', role: 'Sup. de Turno', schedule: 'Supervisor', initials: 'CD' }
  ];

  switchAuthMode(mode: 'pin' | 'pass'): void {
    this.authMode = mode;
    if (mode !== 'pin') this.clearPin();
    this.clearMessage();
  }

  selectStaff(member: typeof this.staff[number]): void {
    this.selectedStaff = { name: member.name, role: member.role, initials: member.initials };
    this.clearPin();
    this.clearMessage();
  }

  pressPin(digit: string): void {
    if (this.enteredPin.length >= 4) return;
    this.enteredPin += digit;
    if (this.enteredPin.length === 4) {
      setTimeout(() => this.triggerLogin(), 250);
    }
  }

  clearPin(): void {
    this.enteredPin = '';
  }

  backspacePin(): void {
    this.enteredPin = this.enteredPin.slice(0, -1);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  triggerLogin(): void {
    if (this.authMode === 'pin' && this.enteredPin.length !== 4) {
      this.loginSuccess = false;
      this.loginMessage = 'Ingresa un PIN de 4 dígitos.';
      return;
    }

    this.loginSuccess = true;
    this.loginMessage = `Autenticación correcta • Bienvenido ${this.selectedStaff.name}`;
    setTimeout(() => this.loginMessage = '', 2800);
  }

  clearMessage(): void {
    this.loginMessage = '';
    this.loginSuccess = false;
  }
}
