import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-barra-superior-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra-superior-admin.component.html',
  styleUrls: ['./barra-superior-admin.component.css']
})
export class BarraSuperiorAdminComponent implements OnInit {
  @Output() crearUsuario = new EventEmitter<void>();
  @Output() exportarExcel = new EventEmitter<void>();

  usuarioActual: string = 'Administrador';
  fechaActual: string = '';
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  ngOnInit() {
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.fechaActual = new Date().toLocaleDateString('es-ES', opciones);

    const sesionInfo = localStorage.getItem('kombat-session');
    if (sesionInfo) {
      const datos = JSON.parse(sesionInfo);
      this.usuarioActual = datos.username;
    }
  }

  cerrarSesion() {
    const sesionInfo = localStorage.getItem('kombat-session');

    if (sesionInfo) {
      const usuario = JSON.parse(sesionInfo).username;

      this.http.post('http://127.0.0.1:8000/api/logout/', { username: usuario }).subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
