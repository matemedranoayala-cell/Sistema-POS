import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-logs-paginados',
  standalone: true,
  imports: [CommonModule, PaginacionComponent],
  templateUrl: './logs-paginados.component.html',
  styleUrls: ['./logs-paginados.component.css']
})
export class LogsPaginadosComponent implements OnInit {
  private http = inject(HttpClient);

  filtroActivo = 'todos';
  paginaActual = 1;
  itemsPorPagina = 3;

  logsBase: any[] = [];
  logsFiltrados: any[] = [];
  logsPaginados: any[] = [];

  ngOnInit() {
    this.cargarLogs();
  }

  cargarLogs() {
    this.http.get<any[]>('http://127.0.0.1:8000/api/bitacora/').subscribe({
      next: (data) => {
        this.logsBase = (data || []).map(log => ({
          ...log,
          rolSesion: this.detectarRolSesion(log)
        }));
        this.aplicarFiltro('todos');
      },
      error: (err) => console.error('Error al cargar bitácora:', err)
    });
  }
  detectarRolSesion(log: any): 'COACH' | 'RECEPCION' | 'ADMIN' {
    const rolExplicito = (log.rol || log.rol_usuario || '').toUpperCase();
    if (rolExplicito === 'COACH' || rolExplicito === 'ENTRENADOR') return 'COACH';
    if (rolExplicito === 'RECEPCION' || rolExplicito === 'CAJA') return 'RECEPCION';
    if (rolExplicito === 'ADMIN' || rolExplicito === 'SUPERADMIN') return 'ADMIN';

    const usuario = (log.usuario || '').toLowerCase();
    const operacion = (log.operacion || '').toLowerCase();
    if (
      usuario.includes('coach') ||
      usuario.includes('@') ||
      operacion.includes('firma de clase') ||
      operacion.includes('asistencia')
    ) {
      return 'COACH';
    }

    if (usuario.includes('recepcion') || usuario.includes('caja')) {
      return 'RECEPCION';
    }

    return 'ADMIN';
  }

  aplicarFiltro(tipo: string) {
    this.filtroActivo = tipo;
    this.paginaActual = 1;

    if (tipo === 'todos') {
      this.logsFiltrados = [...this.logsBase];
    } else if (tipo === 'recepcion') {
      this.logsFiltrados = this.logsBase.filter(log => log.rolSesion === 'RECEPCION');
    } else if (tipo === 'coaches') {
      this.logsFiltrados = this.logsBase.filter(log => log.rolSesion === 'COACH');
    }

    this.actualizarPaginacion(1);
  }

  actualizarPaginacion(pagina: number) {
    this.paginaActual = pagina;
    const inicio = (pagina - 1) * this.itemsPorPagina;
    this.logsPaginados = this.logsFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  revisarDetalle(log: any) {
    Swal.fire({
      title: 'Detalle del Movimiento',
      html: `
        <div style="text-align: left; padding: 10px; font-family: Inter, sans-serif;">
          <p style="margin-bottom: 8px;"><strong>Usuario (Sesión):</strong> ${log.usuario}</p>
          <p style="margin-bottom: 8px;"><strong>Rol de Sesión:</strong> <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 700;">${log.rolSesion}</span></p>
          <p style="margin-bottom: 8px;"><strong>Operación:</strong> <span style="color: #2563eb; font-weight: bold;">${log.operacion}</span></p>
          <p style="margin-bottom: 8px;"><strong>Módulo:</strong> ${log.modulo}</p>
          <hr style="margin: 15px 0; border: 1px solid #e5e7eb;">
          <p style="margin-bottom: 4px;"><strong>Descripción Detallada:</strong></p>
          <p style="color: #4b5563; font-size: 0.95rem; background: #f9fafb; padding: 10px; border-radius: 6px;">
            ${log.detalle || 'Registro de actividad procesado en el sistema.'}
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3b82f6'
    });
  }
}
