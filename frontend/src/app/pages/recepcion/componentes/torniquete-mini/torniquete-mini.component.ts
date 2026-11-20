import { Component, Output, EventEmitter, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AsistenciaService } from '../../../../services/asistencia.service';
import { BitacoraService } from '../../../../services/bitacora.service';
import {
  AlumnoEncontrado,
  BusquedaAlumnosService,
  CriterioBusqueda
} from '../../../../services/busqueda-alumnos.service';
import { BuscadorAccesoComponent } from '../buscador-acceso/buscador-acceso.component';
import { FilaAcceso, FilaAccesoComponent } from '../fila-acceso/fila-acceso.component';
import { ModalResultadosAccesoComponent } from '../modal-resultados-acceso/modal-resultados-acceso.component';

/** Cuántas coincidencias se muestran en la tarjeta; el resto se ve en la ventana. */
const RESULTADOS_EN_TARJETA = 2;

@Component({
  selector: 'app-torniquete-mini',
  standalone: true,
  imports: [CommonModule, BuscadorAccesoComponent, FilaAccesoComponent, ModalResultadosAccesoComponent],
  templateUrl: './torniquete-mini.component.html',
  styleUrls: ['./torniquete-mini.component.css']
})
export class TorniqueteMiniComponent implements OnInit {
  @Output() verTodos = new EventEmitter<void>();
  @ViewChild(BuscadorAccesoComponent) buscador?: BuscadorAccesoComponent;

  private asistenciaService = inject(AsistenciaService);
  private busquedaService = inject(BusquedaAlumnosService);
  private bitacoraService = inject(BitacoraService);
  private toastr = inject(ToastrService);

  /** Último ingreso registrado (se muestra mientras no hay búsqueda). */
  ultimoIngreso: FilaAcceso | null = null;

  /** null = todavía no se buscó nada. */
  resultados: FilaAcceso[] | null = null;
  ultimaBusqueda: { criterio: CriterioBusqueda; termino: string } | null = null;
  buscando = false;
  registrandoId: number | null = null;
  mostrarModalResultados = false;

  get resultadosEnTarjeta(): FilaAcceso[] {
    return (this.resultados ?? []).slice(0, RESULTADOS_EN_TARJETA);
  }

  get resultadosOcultos(): number {
    return Math.max(0, (this.resultados?.length ?? 0) - RESULTADOS_EN_TARJETA);
  }

  ngOnInit() {
    this.cargarDatos();
  }

  /** Recarga el último ingreso. Lo usa también la pantalla de recepción. */
  cargarDatos() {
    this.asistenciaService.obtenerAsistenciasHoy().subscribe({
      next: (data) => {
        const item = Array.isArray(data) ? data[0] : null;
        this.ultimoIngreso = item
          ? {
              id: item.id,
              alumnoId: item.alumno,
              hora: item.hora || this.formatearHora(item.fecha_hora),
              nombre: String(item.nombre || 'ATLETA KOMBAT').toUpperCase(),
              dni: String(item.dni || ''),
              plan: String(item.plan || '1'),
              academia: item.academia || 'Kombat',
              estado: item.estado_acceso || item.estado || 'Permitido'
            }
          : null;
      },
      error: () => {
        this.ultimoIngreso = null;
      }
    });
  }

  buscar(evento: { criterio: CriterioBusqueda; termino: string }) {
    if (!evento.termino) {
      this.toastr.warning(
        evento.criterio === 'ci' ? 'Escribe o escanea el CI del atleta.' : 'Escribe el nombre del atleta.',
        'Torniquete'
      );
      return;
    }

    this.buscando = true;
    this.busquedaService.buscar(evento.criterio, evento.termino).subscribe({
      next: (alumnos) => {
        this.buscando = false;
        this.ultimaBusqueda = evento;
        this.resultados = alumnos.map(a => this.aFila(a));
        this.mostrarModalResultados = false;
      },
      error: (err) => {
        this.buscando = false;
        this.toastr.error(err?.error?.error ?? 'No se pudo realizar la búsqueda.', 'Error');
      }
    });
  }

  limpiarBusqueda() {
    this.resultados = null;
    this.ultimaBusqueda = null;
    this.mostrarModalResultados = false;
  }

  abrirModalResultados() {
    if (this.resultados?.length) this.mostrarModalResultados = true;
  }

  async marcarIngreso(fila: FilaAcceso) {
    if (this.registrandoId !== null) return;

    if (fila.membresiaVigente === false) {
      const confirmacion = await Swal.fire({
        title: 'Membresía no vigente',
        text: fila.vencimientoMembresia
          ? `La membresía de ${fila.nombre} venció el ${fila.vencimientoMembresia}. ¿Registrar el ingreso igual?`
          : `${fila.nombre} no tiene pagos registrados. ¿Registrar el ingreso igual?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, registrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#111827'
      });
      if (!confirmacion.isConfirmed) return;
    }

    this.registrandoId = fila.alumnoId;
    this.asistenciaService.marcarIngreso({
      alumno: fila.alumnoId,
      estado_acceso: 'Permitido'
    }).subscribe({
      next: () => {
        this.registrandoId = null;
        this.bitacoraService.registrarEvento(
          'Ingreso Torniquete',
          'Control de Acceso',
          `Acceso permitido a ${fila.nombre} (CI: ${fila.dni || 'S/N'})`
        ).subscribe();

        this.toastr.success(`Bienvenido ${fila.nombre}`, 'Acceso Permitido');
        this.buscador?.limpiar();
        this.limpiarBusqueda();
        this.cargarDatos();
      },
      error: () => {
        this.registrandoId = null;
        this.toastr.error('No se pudo registrar la asistencia.', 'Error');
      }
    });
  }

  verPerfil(fila: FilaAcceso) {
    const vigencia = fila.membresiaVigente === undefined
      ? ''
      : `<p style="margin: 8px 0;"><strong>Membresía:</strong> ${
          fila.membresiaVigente
            ? `Vigente hasta ${fila.vencimientoMembresia}`
            : (fila.vencimientoMembresia ? `Vencida el ${fila.vencimientoMembresia}` : 'Sin pagos registrados')
        }</p>`;

    Swal.fire({
      title: this.escaparHtml(fila.nombre),
      html: `
        <div style="text-align: left; padding: 10px; font-family: Inter, sans-serif; color: #1e293b;">
          <p style="margin: 8px 0;"><strong>CI / Documento:</strong> ${this.escaparHtml(fila.dni || 'Registrado')}</p>
          <p style="margin: 8px 0;"><strong>Plan Activo:</strong> Plan ID ${this.escaparHtml(fila.plan)}</p>
          <p style="margin: 8px 0;"><strong>Academia:</strong> ${this.escaparHtml(fila.academia)}</p>
          <p style="margin: 8px 0;"><strong>Registro:</strong> ${this.escaparHtml(fila.hora)}</p>
          ${vigencia}
          <p style="margin: 8px 0;"><strong>Estado:</strong> <span style="color: #16a34a; font-weight: 700;">${this.escaparHtml(fila.estado)}</span></p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#2563eb'
    });
  }

  verHistorialCompleto() {
    this.verTodos.emit();
  }

  private aFila(a: AlumnoEncontrado): FilaAcceso {
    return {
      id: a.id,
      alumnoId: a.id,
      hora: 'Listo para ingreso',
      nombre: a.nombre,
      dni: a.dni,
      plan: String(a.plan_id ?? '1'),
      academia: a.academia,
      estado: a.estado,
      membresiaVigente: a.membresia_vigente,
      vencimientoMembresia: a.vencimiento_membresia
    };
  }

  private formatearHora(fechaIso: string): string {
    const d = fechaIso ? new Date(fechaIso) : new Date();
    if (isNaN(d.getTime())) return String(fechaIso);
    return d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  /** Los datos vienen de formularios: se escapan antes de insertarlos en el HTML del popup. */
  private escaparHtml(texto: string): string {
    return String(texto ?? '').replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
    ));
  }
}
