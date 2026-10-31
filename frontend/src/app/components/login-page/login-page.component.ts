import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EntradaTextoComponent } from '../../compartido/componentes/entrada-texto/entrada-texto.component';
import { BotonPrimarioComponent } from '../../compartido/componentes/boton-primario/boton-primario.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, EntradaTextoComponent, BotonPrimarioComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  usuario = '';
  contrasena = '';
  cargando = false;
  mensajeError = '';

  constructor(
    private readonly authService: AuthService,
    private router: Router
  ) {}

  async iniciarSesion(): Promise<void> {
    if (!this.usuario || !this.contrasena) {
      this.mensajeError = 'Por favor, completa ambos campos.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const response = await this.authService.login(this.usuario, this.contrasena);

    if (response.success) {
      const rol = response.rol?.trim().toLowerCase();
      const rutasPorRol: Record<string, string> = {
        superadmin: '/superadmin',
        admin: '/admin',
        administrador: '/admin',
        encargado_general: '/admin',
        recepcion: '/recepcion',
        recepcionista: '/recepcion',
        caja: '/recepcion',
        coach: '/coach',
        entrenador: '/coach',
        tienda: '/tienda',
        encargado_tienda: '/tienda'
      };
      const ruta = rol ? rutasPorRol[rol] : undefined;

      if (ruta) {
        await this.router.navigate([ruta]);
      } else {
        this.mensajeError = 'Rol no reconocido. Contacta al administrador.';
        this.cargando = false;
      }
    } else {
      this.mensajeError = 'Credenciales incorrectas. Intenta nuevamente.';
      this.cargando = false;
    }
  }
}
