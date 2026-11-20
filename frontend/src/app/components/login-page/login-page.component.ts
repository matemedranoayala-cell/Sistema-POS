import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EntradaTextoComponent } from '../../compartido/componentes/entrada-texto/entrada-texto.component';
import { BotonPrimarioComponent } from '../../compartido/componentes/boton-primario/boton-primario.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, EntradaTextoComponent, BotonPrimarioComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  usuario = '';
  contrasena = '';
  cargando = false;
  mensajeError = '';

  /** WhatsApp del administrador de la tienda (sin '+' ni espacios). */
  private readonly whatsappAdministrador = '59175282454';
  readonly rolesDisponibles = [
    'Administrador',
    'Recepción / Caja',
    'Coach / Entrenador',
    'Encargado de Tienda'
  ];
  mostrarRecuperacion = false;
  usuarioRecuperacion = '';
  rolRecuperacion = '';
  errorRecuperacion = '';

  constructor(
    private readonly authService: AuthService,
    private router: Router
  ) {}

  abrirRecuperacion(): void {
    this.usuarioRecuperacion = this.usuario.trim();
    this.rolRecuperacion = '';
    this.errorRecuperacion = '';
    this.mostrarRecuperacion = true;
  }

  @HostListener('document:keydown.escape')
  cerrarRecuperacion(): void {
    this.mostrarRecuperacion = false;
  }

  enviarRecuperacionWhatsApp(): void {
    const usuario = this.usuarioRecuperacion.trim();
    if (!usuario || !this.rolRecuperacion) {
      this.errorRecuperacion = 'Escribe tu usuario y selecciona tu rol.';
      return;
    }

    const mensaje =
      `Hola, soy *${usuario}* (${this.rolRecuperacion}). ` +
      `Olvidé mi contraseña de Kombat Manager. ¿Me ayudas a restablecerla, por favor?`;
    const url = `https://wa.me/${this.whatsappAdministrador}?text=${encodeURIComponent(mensaje)}`;

    // Se abre dentro del clic para que el navegador no lo bloquee como ventana emergente.
    window.open(url, '_blank');
    this.cerrarRecuperacion();
  }

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
