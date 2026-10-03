import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AlumnoService } from '../../services/alumno.service';
import { AsistenciaService } from '../../services/asistencia.service';
import { RenovacionService } from '../../services/renovacion.service';

export const HORARIOS_KOMBAT = [
  { disciplina: 'Kickboxing', horarios: ['Lu/Mie/Vie 9:00-10:15', 'Lu/Mie 18:00-19:30', 'Mar/Jue 16:30-18:00', 'Mar/Jue 19:30-21:00'] },
  { disciplina: 'Brazilian Jiujitsu', horarios: ['Lu/Mie/Vie 7:00-8:30 AM', 'Lu/Mie/Vie 19:30-21:00'] },
  { disciplina: 'Boxeo', horarios: ['Lu/Mie/Vie 16:30-18:00', 'Mar/Jue 19:30-20:45'] },
  { disciplina: 'MMA', horarios: ['Lu/Mie/Vie 16:30-18:00', 'Lu/Mie 18:00-19:30 (Competidores)'] },
  { disciplina: 'Grappling', horarios: ['Mar/Jue 16:30-18:00 (Fundamentals)', 'Mar/Jue 18:00-19:30 (Avanzado)'] },
  { disciplina: 'Wrestling', horarios: ['Martes 7:30-9:00 AM'] },
  { disciplina: 'Boxeo Teens', horarios: ['Lu/Mie/Vie 15:30-16:30 (10-16 años)'] },
  { disciplina: 'Niños/Kids', horarios: ['Lu/Mie/Vie 15:30-16:30 (MMA 4-8)', 'Mar/Jue 18:30-19:30 (BJJ 9-12)', 'Mar/Jue 19:30-20:30 (Kickboxing 9-12)'] }
];

@Component({
  selector: 'app-recepcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './recepcion.component.html',
  styleUrls: ['./recepcion.component.css']
})
export class RecepcionComponent implements OnInit {
  fechaActual = new Date().toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  usuarioActual = 'Recepcionista Central';

  listaHorarios = HORARIOS_KOMBAT;
  ultimosAccesos: any[] = [];
  registrosDelDia: any[] = [];
  directorio: any[] = [];

  mostrarModalInscripcion = false;
  mostrarModalRenovar = false;
  mostrarModalOpenMat = false;
  mostrarModalRegistros = false;
  mostrarModalDirectorio = false;
  mostrarModalArqueo = false;
  mostrarModalPerfil = false;

  inscripcionForm!: FormGroup;
  renovacionForm!: FormGroup;
  openMatForm!: FormGroup;
  arqueoForm!: FormGroup;

  dniTorniquete = '';
  alumnoSeleccionado: any = null;
  cajaCerrada: boolean = false;

  private readonly http = inject(HttpClient);

  constructor(
    private fb: FormBuilder,
    private alumnoService: AlumnoService,
    private asistenciaService: AsistenciaService,
    private renovacionService: RenovacionService
  ) {}

  ngOnInit() {
    const session = localStorage.getItem('kombat-session');
    if(session) {
      const parsed = JSON.parse(session);
      this.usuarioActual = parsed.username || 'Recepcionista Central';
    }
    this.inscripcionForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      dni: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      disciplina_id: ['', Validators.required],
      plan_id: ['', Validators.required],
      es_competidor: [false],
      academia_origen: ['Kombat', Validators.required],
      asociacion: ['']
    });

    this.renovacionForm = this.fb.group({
      dniBusqueda: ['', Validators.required],
      nuevo_plan_id: ['', Validators.required],
      metodo_pago: ['', Validators.required]
    });
    this.openMatForm = this.fb.group({
      nombre: ['', Validators.required],
      dni: ['', Validators.required],
      academia_origen: ['', Validators.required],
      pago_dia: [30, [Validators.required, Validators.min(0)]]
    });

    this.arqueoForm = this.fb.group({
      montoFisico: ['', [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });

    this.cargarDirectorio();
    this.cargarAsistencias();
  }

  cargarDirectorio() {
    this.alumnoService.obtenerAlumnos().subscribe({
      next: (data: any[]) => {
        this.directorio = data.map(alumno => ({
          id: alumno.id,
          nombre: `${alumno.nombre} ${alumno.apellidos || ''}`,
          dni: alumno.dni,
          plan: alumno.estado === 'Visitante' ? 'Pase Diario' : `Plan ID: ${alumno.plan_id || 1}`,
          vencimiento: alumno.academia_origen,
          estado: alumno.estado || 'Activo',
          color: alumno.estado === 'Activo' ? 'green' : (alumno.estado === 'Visitante' ? 'blue' : 'red')
        }));

        this.registrosDelDia = data.map(alumno => {
          const fecha = new Date(alumno.fecha_inscripcion);
          return {
            hora: fecha.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
            tipo: alumno.estado === 'Visitante' ? 'Pase Open Mat' : 'Inscripción',
            detalle: `${alumno.nombre} (${alumno.academia_origen})`,
            monto: alumno.estado === 'Visitante' ? 'Bs 30' : 'Bs 300'
          };
        }).reverse();
      },
      error: (err: any) => console.error('Error al cargar alumnos:', err)
    });
  }

  cargarAsistencias() {
    this.asistenciaService.obtenerAsistenciasHoy().subscribe({
      next: (data: any[]) => {
        this.ultimosAccesos = data.map(acceso => {
          const alumnoInfo = this.directorio.find(a => a.id === acceso.alumno) || { nombre: 'Desconocido', plan: '-', vencimiento: '' };
          const fecha = new Date(acceso.fecha_hora);
          return {
            hora: fecha.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
            nombre: alumnoInfo.nombre,
            plan: alumnoInfo.plan,
            coach: alumnoInfo.vencimiento,
            estado: acceso.estado_acceso,
            color: acceso.estado_acceso === 'Permitido' ? 'blue' : 'red'
          };
        }).reverse();
      },
      error: (err: any) => console.error('Error al cargar asistencias:', err)
    });
  }

  guardarAlumno() {
    if (this.inscripcionForm.valid) {
      this.alumnoService.inscribirAlumno(this.inscripcionForm.value).subscribe({
        next: () => {
          alert('Alumno regular inscrito exitosamente.');
          this.cerrarModales();
          this.cargarDirectorio();
        },
        error: (error: any) => console.error('Error al guardar alumno', error)
      });
    } else {
      this.marcarCampos(this.inscripcionForm);
    }
  }

  async guardarOpenMat() {
    if (this.openMatForm.valid) {
      const formVal = this.openMatForm.value;
      try {
        const nuevoVisitante: any = await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/alumnos/', {
          nombre: formVal.nombre,
          apellidos: '(Visita Open Mat)',
          dni: formVal.dni,
          academia_origen: formVal.academia_origen,
          es_competidor: true,
          estado: 'Visitante'
        }));
        await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/pagos/', {
          alumno: nuevoVisitante.id,
          monto: formVal.pago_dia,
          proximo_vencimiento: new Date().toISOString().split('T')[0],
          metodo_pago: 'efectivo'
        }));

        await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/bitacora/', {
          usuario: this.usuarioActual,
          operacion: 'Pase Diario Externo',
          modulo: 'Recepción y Caja',
          detalle: `Visitante ${formVal.nombre} de academia ${formVal.academia_origen} pagó Bs ${formVal.pago_dia} para Open Mat.`,
          estado: 'Completado',
          color: 'green'
        }));

        alert('Pase diario generado. El alumno ya puede ingresar al tatami.');
        this.cerrarModales();
        this.cargarDirectorio();
      } catch (error) {
        alert('Error al registrar pase diario.');
      }
    } else {
      this.marcarCampos(this.openMatForm);
    }
  }

  registrarIngreso() {
    if (!this.dniTorniquete.trim()) return;

    const alumnoEncontrado = this.directorio.find(a => a.dni === this.dniTorniquete.trim());

    if (alumnoEncontrado) {
      const nuevaAsistencia = {
        alumno: alumnoEncontrado.id,
        estado_acceso: 'Permitido'
      };

      this.asistenciaService.marcarIngreso(nuevaAsistencia).subscribe({
        next: () => {
          this.dniTorniquete = '';
          this.cargarAsistencias();
        },
        error: (err: any) => console.error('Error al registrar acceso', err)
      });
    } else {
      alert(' CI no encontrado en la base de datos.');
    }
  }

  procesarRenovacion() {
    if (this.renovacionForm.valid) {
      const formVal = this.renovacionForm.value;
      const alumnoEncontrado = this.directorio.find(a => a.dni === formVal.dniBusqueda.trim());

      if (alumnoEncontrado) {
        const nuevoPago = {
          alumno: alumnoEncontrado.id,
          monto: 300,
          proximo_vencimiento: '2026-10-30',
          metodo_pago: formVal.metodo_pago
        };

        this.renovacionService.registrarRenovacion(nuevoPago).subscribe({
          next: () => {
            this.cerrarModales();
            alert('¡Pago registrado con éxito!');
          },
          error: (err: any) => console.error('Error al procesar pago', err)
        });
      } else {
        alert('Alumno no encontrado. Revisa el DNI.');
      }
    } else {
      this.marcarCampos(this.renovacionForm);
    }
  }

  async procesarArqueo() {
    if (this.arqueoForm.valid) {
      const monto = this.arqueoForm.value.montoFisico;
      const obs = this.arqueoForm.value.observaciones || 'Cierre de turno sin novedades';

      try {
        await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/cierre-caja/', {
          total_ingresos: monto,
          observaciones: obs,
          estado: 'Auditoría Pendiente'
        }));

        await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/bitacora/', {
          usuario: this.usuarioActual,
          operacion: 'Cierre de Caja',
          modulo: 'Recepción y Caja',
          detalle: `Arqueo declarado físico: Bs ${monto}. Observaciones: ${obs}`,
          estado: 'Pendiente Revisión',
          color: 'orange'
        }));

        this.cerrarModales();
        this.cajaCerrada = true;
        alert('Caja cerrada y arqueo enviado al Administrador. El sistema se bloqueará para evitar alteraciones.');
      } catch (error) {
        alert('Error conectando con el servidor para cerrar caja.');
      }
    } else {
      this.marcarCampos(this.arqueoForm);
    }
  }

  abrirModal(modal: string, data?: any) {
    if (modal === 'inscripcion') this.mostrarModalInscripcion = true;
    if (modal === 'renovar') this.mostrarModalRenovar = true;
    if (modal === 'openmat') this.mostrarModalOpenMat = true;
    if (modal === 'registros') this.mostrarModalRegistros = true;
    if (modal === 'directorio') this.mostrarModalDirectorio = true;
    if (modal === 'arqueo') this.mostrarModalArqueo = true;
    if (modal === 'perfil') {
      this.alumnoSeleccionado = data;
      this.mostrarModalPerfil = true;
    }
  }

  cerrarModales() {
    this.mostrarModalInscripcion = false;
    this.mostrarModalRenovar = false;
    this.mostrarModalOpenMat = false;
    this.mostrarModalRegistros = false;
    this.mostrarModalDirectorio = false;
    this.mostrarModalArqueo = false;
    this.mostrarModalPerfil = false;
    this.alumnoSeleccionado = null;
    this.inscripcionForm.reset({ academia_origen: 'Kombat', es_competidor: false });
    this.renovacionForm.reset();
    this.openMatForm.reset({ pago_dia: 30 });
    this.arqueoForm.reset();
  }

  private marcarCampos(form: FormGroup) {
    Object.keys(form.controls).forEach(key => form.get(key)?.markAsTouched());
  }
}
