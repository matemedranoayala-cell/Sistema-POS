import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion.component';

export const HORARIOS_KOMBAT = [
  { disciplina: 'Kickboxing', horarios: ['Lu/Mie/Vie 9:00-10:15', 'Lu/Mie 18:00-19:30', 'Mar/Jue 16:30-18:00', 'Mar/Jue 19:30-21:00'] },
  { disciplina: 'Brazilian Jiujitsu', horarios: ['Lu/Mie/Vie 7:00-8:30 AM', 'Lu/Mie/Vie 19:30-21:00'] },
  { disciplina: 'Boxeo', horarios: ['Lu/Mie/Vie 16:30-18:00', 'Mar/Jue 19:30-20:45'] },
  { disciplina: 'MMA', horarios: ['Lu/Mie/Vie 16:30-18:00', 'Lu/Mie 18:00-19:30 (Competidores)'] },
  { disciplina: 'Grappling', horarios: ['Mar/Jue 16:30-18:00 (Fundamentals)', 'Mar/Jue 18:00-19:30 (Avanzado)'] },
  { disciplina: 'Wrestling', horarios: ['Martes 7:30-9:00 AM'] },
  { disciplina: 'Boxeo Teens', horarios: ['Lu/Mie/Vie 15:30-16:30 (10-16 años)'] },
  { disciplina: 'Niños/Kids', horarios: ['Lu/Mie/Vie 15:30-16:30 (MMA 4-8)', 'Mar/Jue 18:30-19:30 (BJJ 9-12)', 'Mar/Jue 19:30-20:30 (Kickboxing 9-12)'] },
  { disciplina: 'Open Mat', horarios: ['Sábados 11:00 AM (Abierto)'] }
];

@Component({
  selector: 'app-horarios-paginados',
  standalone: true,
  imports: [CommonModule, PaginacionComponent],
  templateUrl: './horarios-paginados.component.html',
  styleUrls: ['./horarios-paginados.component.css']
})
export class HorariosPaginadosComponent implements OnInit {
  horarios = HORARIOS_KOMBAT;
  horariosPaginados: any[] = [];
  paginaActual = 1;
  itemsPorPagina = 4;
  mostrarFormularioHorarios = false;

  ngOnInit() {
    this.actualizarPaginacion(1);
  }

  abrirHorarios() {
    this.paginaActual = 1;
    this.actualizarPaginacion(1);
    this.mostrarFormularioHorarios = true;
  }

  cerrarHorarios() {
    this.mostrarFormularioHorarios = false;
  }

  actualizarPaginacion(pagina: number) {
    this.paginaActual = pagina;
    const inicio = (pagina - 1) * this.itemsPorPagina;
    this.horariosPaginados = this.horarios.slice(inicio, inicio + this.itemsPorPagina);
  }
}
