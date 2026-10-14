import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion.component';
import { AlumnoService } from '../../../../services/alumno.service';

@Component({
  selector: 'app-directorio-paginado',
  standalone: true,
  imports: [CommonModule, PaginacionComponent],
  templateUrl: './directorio-paginado.component.html'
})
export class DirectorioPaginadoComponent implements OnInit {
  @Output() volver = new EventEmitter<void>();
  private alumnoService = inject(AlumnoService);

  atletas: any[] = [];
  atletasPaginados: any[] = [];
  paginaActual = 1;
  itemsPorPagina = 4;

  ngOnInit() {
    this.cargarDirectorio();
  }

  cargarDirectorio() {
    this.alumnoService.obtenerAlumnos().subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : [];
        this.atletas = lista.map(a => ({
          nombre: `${a.nombre || ''} ${a.apellidos || ''}`.trim().toUpperCase() || 'ATLETA KOMBAT',
          ci: a.dni || 'S/N',
          plan: a.disciplina_id ? `${a.disciplina_id} (Plan ${a.plan_id || 1})` : `Plan ${a.plan_id || 1}`,
          academia: a.academia_origen || 'Kombat',
          vencimiento: a.fecha || (a.fecha_inscripcion ? String(a.fecha_inscripcion).split('T')[0] : 'Activo'),
          estado: a.estado || 'Activo'
        }));
        this.actualizarPaginacion(1);
      },
      error: () => {
        this.atletas = [];
        this.actualizarPaginacion(1);
      }
    });
  }

  actualizarPaginacion(pagina: number) {
    this.paginaActual = pagina;
    const inicio = (pagina - 1) * this.itemsPorPagina;
    this.atletasPaginados = this.atletas.slice(inicio, inicio + this.itemsPorPagina);
  }
}
