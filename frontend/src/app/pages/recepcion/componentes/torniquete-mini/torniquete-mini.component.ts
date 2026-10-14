import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AsistenciaService } from '../../../../services/asistencia.service';
import { AlumnoService } from '../../../../services/alumno.service';
import { BitacoraService } from '../../../../services/bitacora.service';

@Component({
  selector: 'app-torniquete-mini',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './torniquete-mini.component.html',
  styleUrls: ['./torniquete-mini.component.css']
})
export class TorniqueteMiniComponent implements OnInit {
  @Output() verTodos = new EventEmitter<void>();

  private asistenciaService = inject(AsistenciaService);
  private alumnoService = inject(AlumnoService);
  private bitacoraService = inject(BitacoraService);
  private toastr = inject(ToastrService);

  busqueda = '';
  registros: any[] = [];
  alumnos: any[] = [];

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.alumnoService.obtenerAlumnos().subscribe({
      next: (listaAlumnos) => {
        this.alumnos = Array.isArray(listaAlumnos) ? listaAlumnos : [];
      },
      error: () => {
        this.alumnos = [];
      }
    });

    this.asistenciaService.obtenerAsistenciasHoy().subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : [];
        this.registros = lista.map(item => ({
          id: item.id,
          alumno_id: item.alumno,
          hora: item.hora || this.formatearHora(item.fecha_hora),
          nombre: String(item.nombre || 'ATLETA KOMBAT').toUpperCase(),
          dni: String(item.dni || ''),
          plan: String(item.plan || '1'),
          academia: item.academia || 'Kombat',
          estado: item.estado_acceso || item.estado || 'Permitido'
        }));
      },
      error: () => {
        this.registros = [];
      }
    });
  }

  private formatearHora(fechaIso: string): string {
    if (!fechaIso) {
      return new Date().toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    const d = new Date(fechaIso);
    if (isNaN(d.getTime())) return String(fechaIso);
    return d.toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  get registrosFiltrados(): any[] {
    const termino = String(this.busqueda || '').toLowerCase().trim();
    if (!termino) {
      return this.registros.slice(0, 3);
    }

    const coincidenciasAsistencia = this.registros.filter(reg => {
      const nom = String(reg.nombre || '').toLowerCase();
      const ci = String(reg.dni || '').toLowerCase();
      const acad = String(reg.academia || '').toLowerCase();
      return nom.includes(termino) || ci.includes(termino) || acad.includes(termino);
    });

    const dnisEnLista = new Set(coincidenciasAsistencia.map(r => String(r.dni)));
    const coincidenciasPadron = this.alumnos
      .filter(a => {
        const nom = `${a.nombre || ''} ${a.apellidos || ''}`.toLowerCase();
        const ci = String(a.dni || '').toLowerCase();
        const coincide = nom.includes(termino) || ci.includes(termino);
        return coincide && !dnisEnLista.has(String(a.dni || ''));
      })
      .map(a => ({
        id: a.id,
        alumno_id: a.id,
        hora: 'Listo para ingreso',
        nombre: `${a.nombre || ''} ${a.apellidos || ''}`.trim().toUpperCase(),
        dni: String(a.dni || ''),
        plan: String(a.plan_id || '1'),
        academia: a.academia_origen || 'Kombat',
        estado: a.estado || 'Activo'
      }));

    return [...coincidenciasAsistencia, ...coincidenciasPadron].slice(0, 3);
  }

  marcarIngreso() {
    const termino = String(this.busqueda || '').trim();
    if (!termino) {
      this.toastr.warning(
        'Escribe el CI o nombre del atleta en el buscador.',
        'Torniquete'
      );
      return;
    }

    const encontrado = this.alumnos.find(a => {
      const ci = String(a.dni || '').trim().toLowerCase();
      const nom = `${a.nombre || ''} ${a.apellidos || ''}`.toLowerCase();
      return ci === termino.toLowerCase() || nom.includes(termino.toLowerCase());
    });

    if (!encontrado) {
      this.toastr.error(
        `No se encontro ningun atleta con "${termino}".`,
        'Acceso Denegado'
      );
      return;
    }

    this.asistenciaService.marcarIngreso({
      alumno: encontrado.id,
      estado_acceso: 'Permitido'
    }).subscribe({
      next: () => {
        const nom = `${encontrado.nombre || ''} ${encontrado.apellidos || ''}`
          .trim()
          .toUpperCase();
        this.bitacoraService.registrarEvento(
          'Ingreso Torniquete',
          'Control de Acceso',
          `Acceso permitido a ${nom} (CI: ${encontrado.dni || 'S/N'})`
        ).subscribe();

        this.toastr.success(`Bienvenido ${nom}`, 'Acceso Permitido');
        this.busqueda = '';
        this.cargarDatos();
      },
      error: () => {
        this.toastr.error('No se pudo registrar la asistencia.', 'Error');
      }
    });
  }

  verPerfil(reg: any) {
    Swal.fire({
      title: reg.nombre,
      html: `
        <div style="text-align: left; padding: 10px; font-family: Inter, sans-serif; color: #1e293b;">
          <p style="margin: 8px 0;"><strong>CI / Documento:</strong> ${reg.dni || 'Registrado'}</p>
          <p style="margin: 8px 0;"><strong>Plan Activo:</strong> Plan ID ${reg.plan}</p>
          <p style="margin: 8px 0;"><strong>Academia:</strong> ${reg.academia}</p>
          <p style="margin: 8px 0;"><strong>Registro:</strong> ${reg.hora}</p>
          <p style="margin: 8px 0;"><strong>Estado:</strong> <span style="color: #16a34a; font-weight: 700;">${reg.estado}</span></p>
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
}
