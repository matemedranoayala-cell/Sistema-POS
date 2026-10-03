import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit, OnDestroy {
  currentTime = '';
  private timer: any;

  sucursales = ['Zona Sur', 'Sopocachi', 'San Pedro'];
  sucursalSeleccionada = 'Zona Sur';

  usuariosPreguardados = [
    { id: 'recepcion', nombre: 'Recepción', rol: 'Recepción', iniciales: 'RC' },
    { id: 'encargado', nombre: 'Administrador', rol: 'Admin Head', iniciales: 'AD' }
  ];

  usuarioSeleccionado: any = this.usuariosPreguardados[0];

  modoCoach = false;
  correoCoach = '';
  usernameManual = '';
  password = '';
  keepSession = false;
  loginMessage = '';
  isLoading = false;

  secretClickCount = 0;
  showSecretLogin = false;

  constructor(
    private readonly authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.updateClock();
    this.timer = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy() { if (this.timer) { clearInterval(this.timer); } }

  updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-BO', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  seleccionarSucursal(sucursal: string) { this.sucursalSeleccionada = sucursal; }

  seleccionarUsuario(usuario: any) {
    this.modoCoach = false;
    this.usuarioSeleccionado = usuario;
    this.correoCoach = '';
    this.password = '';
    this.loginMessage = '';
  }

  activarLoginCoach() {
    this.modoCoach = true;
    this.usuarioSeleccionado = null;
    this.correoCoach = '';
    this.password = '';
    this.loginMessage = '';
  }

  triggerSecretAdmin() {
    this.secretClickCount++;
    if (this.secretClickCount >= 3) {
      this.showSecretLogin = true;
      this.secretClickCount = 0;
      this.password = '';
    }
  }

  cancelSecretLogin() {
    this.showSecretLogin = false;
    this.usernameManual = '';
    this.password = '';
  }

  async triggerLogin(): Promise<void> {
    let activeUsername = '';
    if (this.showSecretLogin) { activeUsername = this.usernameManual; }
    else if (this.modoCoach) { activeUsername = this.correoCoach; }
    else { activeUsername = this.usuarioSeleccionado?.id; }

    if (!activeUsername || !this.password) {
      this.loginMessage = 'Por favor, completa los campos requeridos.';
      return;
    }

    this.isLoading = true;
    this.loginMessage = '';

    let backendUsername = activeUsername;
    if (this.showSecretLogin && activeUsername === 'ADK') { backendUsername = 'admin'; }

    const response = await this.authService.login(backendUsername, this.password);

    if (response.success) {
      // --- REGISTRAR INICIO DE SESIÓN EN LA BITÁCORA ---
      try {
        await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/bitacora/', {
          usuario: backendUsername,
          operacion: 'Inicio de Sesión',
          modulo: 'Autenticación',
          detalle: `Ingreso autorizado al sistema.`,
          estado: 'Exitoso',
          color: 'blue'
        }));
      } catch (e) { console.error("No se pudo registrar el log", e); }
      // -------------------------------------------------

      if (this.keepSession) { localStorage.setItem('kombat-keep-session', 'true'); }
      localStorage.setItem('kombat-branch', '1');

      if (this.showSecretLogin && activeUsername === 'ADK') { this.router.navigate(['/superadmin']); }
      else if (this.showSecretLogin && activeUsername !== 'ADK') { this.router.navigate(['/admin']); }
      else if (this.modoCoach) { this.router.navigate(['/coach']); }
      else {
        if (activeUsername === 'recepcion') { this.router.navigate(['/recepcion']); }
        else if (activeUsername === 'encargado') { this.router.navigate(['/admin']); }
      }
    } else {
      this.loginMessage = 'Credenciales incorrectas.';
      this.isLoading = false;
    }
  }
}
