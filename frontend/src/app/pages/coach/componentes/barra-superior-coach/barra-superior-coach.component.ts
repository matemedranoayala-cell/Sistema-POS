import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-barra-superior-coach',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra-superior-coach.component.html',
  styleUrls: ['./barra-superior-coach.component.css']
})
export class BarraSuperiorCoachComponent implements OnInit {
  @Input() claseActiva = false;
  @Output() abrirMisHorarios = new EventEmitter<void>();

  private router = inject(Router);

  usuarioActual = 'mauricio@gmail.com';
  fechaActual = '';

  ngOnInit() {
    const guardado = localStorage.getItem('username') || localStorage.getItem('usuario');
    if (guardado) {
      this.usuarioActual = guardado;
    }
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.fechaActual = new Date().toLocaleDateString('es-ES', opciones);
  }

  get horariosSeleccionados(): string[] {
    const datos = sessionStorage.getItem('horarios_coach_activos') || localStorage.getItem('horarios_coach_permanentes');
    if (!datos) return [];
    try {
      return JSON.parse(datos);
    } catch {
      return [];
    }
  }

  get textoClaseBarra(): string {
    const lista = this.horariosSeleccionados;
    if (lista.length === 0) return 'Sin horario asignado';
    if (lista.length === 1) return lista[0];
    return `${lista[0]} (+${lista.length - 1} más)`;
  }

  cerrarSesion() {
    sessionStorage.removeItem('horarios_coach_activos');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
