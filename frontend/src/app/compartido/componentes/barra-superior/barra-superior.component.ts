import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra-superior.component.html',
  styleUrls: ['./barra-superior.component.css']
})
export class BarraSuperiorComponent implements OnInit {
  fechaActual = '';
  usuarioActual = 'recepcion';

  @Output() clickArqueo = new EventEmitter<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.fechaActual = new Date().toLocaleDateString('es-BO', opciones);

    const sesion = localStorage.getItem('kombat-session');
    if (sesion) {
      const datos = JSON.parse(sesion);
      this.usuarioActual = datos.rol ? datos.rol : datos.username;
    }
  }

  abrirArqueo() {
    this.clickArqueo.emit();
  }

  cerrarSesion() {
    localStorage.removeItem('kombat-session');
    this.router.navigate(['/login']);
  }
}
