import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AlumnoService } from '../../../../services/alumno.service';
import { BitacoraService } from '../../../../services/bitacora.service';

@Component({
  selector: 'app-modal-nuevo-alumno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-nuevo-alumno.component.html',
  styleUrls: ['./modal-nuevo-alumno.component.css']
})
export class ModalNuevoAlumnoComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();

  private alumnoService = inject(AlumnoService);
  private bitacoraService = inject(BitacoraService);
  private toastr = inject(ToastrService);

  alumno = {
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: '',
    email: '',
    disciplina: '',
    plan: '',
    esCompetidor: false,
    academiaOrigen: 'Kombat (Local)',
    asociacion: ''
  };

  cerrarModal() {
    this.cerrar.emit();
  }

  registrarAlumno() {
    if (!this.alumno.nombres.trim() || !this.alumno.dni.trim() || !this.alumno.disciplina || !this.alumno.plan) {
      this.toastr.warning('Completa Nombres, CI, Disciplina y Plan.', 'Datos Incompletos');
      return;
    }

    this.alumnoService.inscribirAlumno(this.alumno).subscribe({
      next: (respuesta) => {
        this.bitacoraService.registrarEvento(
          'Inscripcion Alumno',
          'Recepcion',
          `Nuevo atleta inscrito: ${this.alumno.nombres} ${this.alumno.apellidos} (CI: ${this.alumno.dni}) - ${this.alumno.disciplina}`
        ).subscribe();

        this.toastr.success(`Atleta ${this.alumno.nombres} inscrito en la base de datos.`, 'Inscripcion Exitosa');
        this.guardar.emit(respuesta);
        this.cerrar.emit();
      },
      error: () => {
        this.toastr.error('No se pudo guardar el alumno en el servidor.', 'Error de Conexion');
      }
    });
  }
}
