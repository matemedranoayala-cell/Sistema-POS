import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AlumnoService } from '../../services/alumno.service';
import { AsistenciaService } from '../../services/asistencia.service';
import { RenovacionService } from '../../services/renovacion.service';
import { CierreCajaService } from '../../services/cierre-caja.service';

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

  ultimosAccesos: any[] = [];
  registrosDelDia: any[] = [];
  directorio: any[] = [];

  mostrarModalInscripcion = false;
  mostrarModalRenovar = false;
  mostrarModalRegistros = false;
  mostrarModalDirectorio = false;
  mostrarModalArqueo = false;
  mostrarModalPerfil = false;

  inscripcionForm!: FormGroup;
  renovacionForm!: FormGroup;
  arqueoForm!: FormGroup;

  dniTorniquete = '';
  alumnoSeleccionado: any = null;
  cajaCerrada: boolean = false; // CANDADO DE CAJA

  constructor(
    private fb: FormBuilder,
    private alumnoService: AlumnoService,
    private asistenciaService: AsistenciaService,
    private renovacionService: RenovacionService,
    private cierreCajaService: CierreCajaService
  ) {}

  ngOnInit() {
    this.inscripcionForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      dni: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      plan_id: ['', Validators.required],
      disciplina_id: ['', Validators.required]
    });

    this.renovacionForm = this.fb.group({
      dniBusqueda: ['', Validators.required],
      nuevo_plan_id: ['', Validators.required],
      metodo_pago: ['', Validators.required]
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
          plan: `Plan ID: ${alumno.plan_id}`,
          vencimiento: 'Ver en Pagos',
          estado: alumno.estado || 'Activo',
          color: alumno.estado === 'Activo' ? 'green' : 'red'
        }));

        this.registrosDelDia = data.map(alumno => {
          const fecha = new Date(alumno.fecha_inscripcion);
          return {
            hora: fecha.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
            tipo: 'Inscripción',
            detalle: `Nuevo Alumno: ${alumno.nombre}`,
            monto: 'Bs 300'
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
          const alumnoInfo = this.directorio.find(a => a.id === acceso.alumno) || { nombre: 'Desconocido', plan: '-' };
          const fecha = new Date(acceso.fecha_hora);
          return {
            hora: fecha.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
            nombre: alumnoInfo.nombre,
            plan: alumnoInfo.plan,
            coach: 'Central',
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
          this.cerrarModales();
          this.cargarDirectorio();
        },
        error: (error: any) => console.error('Error al guardar alumno', error)
      });
    } else {
      this.marcarCampos(this.inscripcionForm);
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
      alert('DNI no encontrado en la base de datos.');
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

  procesarArqueo() {
    if (this.arqueoForm.valid) {
      const datosCierre = {
        total_ingresos: this.arqueoForm.value.montoFisico,
        observaciones: this.arqueoForm.value.observaciones || 'Cierre de turno sin novedades'
      };

      this.cierreCajaService.registrarCierre(datosCierre).subscribe({
        next: () => {
          this.cerrarModales();
          this.cajaCerrada = true;
          alert('Caja cerrada y arqueo enviado al Administrador. El sistema se bloqueará para evitar alteraciones.');
        },
        error: (err: any) => console.error('Error al registrar cierre de caja', err)
      });
    } else {
      this.marcarCampos(this.arqueoForm);
    }
  }

  abrirModal(modal: string, data?: any) {
    if (modal === 'inscripcion') this.mostrarModalInscripcion = true;
    if (modal === 'renovar') this.mostrarModalRenovar = true;
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
    this.mostrarModalRegistros = false;
    this.mostrarModalDirectorio = false;
    this.mostrarModalArqueo = false;
    this.mostrarModalPerfil = false;
    this.alumnoSeleccionado = null;
    this.inscripcionForm.reset();
    this.renovacionForm.reset();
    this.arqueoForm.reset();
  }

  private marcarCampos(form: FormGroup) {
    Object.keys(form.controls).forEach(key => form.get(key)?.markAsTouched());
  }
}
