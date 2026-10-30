import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-barra-superior-tienda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra-superior-tienda.component.html'
})
export class BarraSuperiorTiendaComponent {
  @Input() fechaActual = '';
  @Input() usuarioActual = 'Encargado de Tienda';
  @Output() abrirArqueo = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  cerrarSesion() {
    this.authService.logout();
    localStorage.removeItem('kombat_sesion');
    this.router.navigate(['/login']);
  }
}
