import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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
    { id: 'encargado', nombre: 'Administrador', rol: 'Admin Head', iniciales: 'AD' }, // <-- id modificado
    { id: 'entrenador', nombre: 'Entrenador', rol: 'Coach', iniciales: 'EN' }
  ];

  usuarioSeleccionado = this.usuariosPreguardados[0];

  usernameManual = '';
  password = '';
  keepSession = false;
  loginMessage = '';
  isLoading = false;

  secretClickCount = 0;
  showSecretLogin = false;

  constructor(private readonly authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.updateClock();
    this.timer = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-BO', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  seleccionarSucursal(sucursal: string) {
    this.sucursalSeleccionada = sucursal;
  }

  seleccionarUsuario(usuario: any) {
    this.usuarioSeleccionado = usuario;
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
    const activeUsername = this.showSecretLogin ? this.usernameManual : this.usuarioSeleccionado.id;

    if (!activeUsername || !this.password) {
      this.loginMessage = 'Por favor, completa los campos requeridos.';
      return;
    }

    this.isLoading = true;
    this.loginMessage = '';

    const response = await this.authService.login(activeUsername, this.password);

    if (response.success) {
      if (this.keepSession) {
        localStorage.setItem('kombat-keep-session', 'true');
      }
      localStorage.setItem('kombat-branch', this.sucursalSeleccionada);

      switch (response.rol) {
        case 'SUPERADMIN':
          this.router.navigate(['/superadmin']);
          break;
        case 'RECEPCIONISTA':
          this.router.navigate(['/recepcion']);
          break;
        case 'ENCARGADO_TIENDA':
          this.router.navigate(['/tienda']);
          break;
        default:
          this.router.navigate(['/coach']);
      }
    } else {
      this.loginMessage = 'Credenciales incorrectas.';
      this.isLoading = false;
    }
  }
}
