import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion.component';
import { AsistenciaService } from '../../../../services/asistencia.service';

@Component({
  selector: 'app-historial-torniquete',
  standalone: true,
  imports: [CommonModule, PaginacionComponent],
  templateUrl: './historial-torniquete.component.html'
})
export class HistorialTorniqueteComponent implements OnInit {
  @Output() volver = new EventEmitter<void>();
  private asistenciaService = inject(AsistenciaService);

  accesos: any[] = [];
  accesosPaginados: any[] = [];
  paginaActual = 1;
  itemsPorPagina = 4;

  ngOnInit() {
    this.asistenciaService.obtenerAsistenciasHoy().subscribe({
      next: (data) => {
        this.accesos = (data || []).map(a => ({
          hora: a.hora || 'Hoy',
          nombre: (a.nombre || 'ATLETA KOMBAT').toUpperCase(),
          plan: a.plan || '1',
          academia: a.academia || 'Kombat',
          estado: a.estado_acceso || a.estado || 'Permitido'
        }));
        this.actualizarPaginacion(1);
      },
      error: () => {
        this.actualizarPaginacion(1);
      }
    });
  }

  actualizarPaginacion(pagina: number) {
    this.paginaActual = pagina;
    const inicio = (pagina - 1) * this.itemsPorPagina;
    this.accesosPaginados = this.accesos.slice(inicio, inicio + this.itemsPorPagina);
  }
}
