import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthModeTabsComponent, AuthMode } from '../auth-mode-tabs/auth-mode-tabs.component';
import { CredentialsLoginComponent } from '../credentials-login/credentials-login.component';
import { LoginFeedbackComponent } from '../login-feedback/login-feedback.component';
import { PinLoginComponent } from '../pin-login/pin-login.component';
import { StaffMember, StaffSelectorComponent } from '../staff-selector/staff-selector.component';
import { StatusBarComponent } from '../status-bar/status-bar.component';
import { AuthService } from '../../services/auth.service';
import { DashboardPageComponent } from '../dashboard/dashboard-page/dashboard-page.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    StatusBarComponent,
    StaffSelectorComponent,
    AuthModeTabsComponent,
    PinLoginComponent,
    CredentialsLoginComponent,
    LoginFeedbackComponent,
    DashboardPageComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  constructor(private readonly authService: AuthService) {}

  authMode: AuthMode = 'pin';
  enteredPin = '';
  username = '';
  password = '';
  passwordVisible = false;
  loginMessage = '';
  loginSuccess = false;
  loggedIn = false;

  selectedStaff: StaffMember = {
    name: 'Mateo Medrano',
    role: 'Cajero Matutino',
    initials: 'CM',
    shortName: 'Carlos M.',
    schedule: '06:00 - 14:00'
  };

  staff: StaffMember[] = [
    {
      name: 'Mateo Medrano',
      shortName: 'Mateo M.',
      role: 'Cajero Matutino',
      schedule: '06:00 - 14:00',
      initials: 'CM'
    },
    {
      name: 'Ronal Poma',
      shortName: 'Ronal P.',
      role: 'Recepción Senior',
      schedule: 'Recepción',
      initials: 'VR'
    },
    {
      name: 'Coach Maurico',
      shortName: 'Coach Mauricio',
      role: 'Sup. de Turno',
      schedule: 'Supervisor',
      initials: 'CD'
    }
  ];

  switchAuthMode(mode: AuthMode): void {
    this.authMode = mode;
    if (mode !== 'pin') {
      this.clearPin();
    }
    if (mode === 'pin') {
      this.username = '';
      this.password = '';
    }
    this.clearMessage();
  }

  selectStaff(member: StaffMember): void {
    this.selectedStaff = {
      name: member.name,
      role: member.role,
      initials: member.initials,
      shortName: member.shortName,
      schedule: member.schedule
    };
    this.clearPin();
    this.clearMessage();
  }

  pressPin(digit: string): void {
    if (this.enteredPin.length >= 4) {
      return;
    }

    this.enteredPin += digit;

    if (this.enteredPin.length === 4) {
      setTimeout(() => this.triggerLogin(), 250);
    }
  }

  clearPin(): void {
    this.enteredPin = '';
  }

  backspacePin(): void {
    if (this.enteredPin.length > 0) {
      this.enteredPin = this.enteredPin.slice(0, -1);
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  async triggerLogin(): Promise<void> {
    if (this.authMode === 'pin' && this.enteredPin.length !== 4) {
      this.loginSuccess = false;
      this.loginMessage = 'Ingresa un PIN de 4 dígitos.';
      return;
    }

    const validLogin = await this.authService.login(
      this.selectedStaff,
      this.authMode,
      this.enteredPin,
      this.username,
      this.password
    );

    this.loginSuccess = validLogin;
    this.loginMessage = validLogin
      ? `Autenticación correcta • Bienvenido ${this.selectedStaff.name}`
      : 'Datos incorrectos. Revisa tu PIN o tus credenciales.';
    this.loggedIn = validLogin;
  }

  logout(): void {
    this.authService.logout();
    this.loggedIn = false;
    this.clearPin();
    this.username = '';
    this.password = '';
    this.clearMessage();
  }

  clearMessage(): void {
    this.loginMessage = '';
    this.loginSuccess = false;
  }
}
