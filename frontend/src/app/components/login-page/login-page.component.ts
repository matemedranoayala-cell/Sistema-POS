import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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
    private router: Router,
    private http: HttpClient
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
      const rol = response.rol;
      if (rol === 'admin') {
        this.router.navigate(['/admin']);
      } else if (rol === 'recepcion') {
        this.router.navigate(['/recepcion']);
      } else {
        this.router.navigate(['/coach']);
      }
    } else {
      this.mensajeError = 'Credenciales incorrectas. Intenta nuevamente.';
      this.cargando = false;
    }
  }
}
