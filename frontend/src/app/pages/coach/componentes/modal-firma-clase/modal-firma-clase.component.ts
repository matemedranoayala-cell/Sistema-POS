import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BitacoraService } from '../../../../services/bitacora.service';

@Component({
  selector: 'app-modal-firma-clase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-firma-clase.component.html',
  styleUrls: ['./modal-firma-clase.component.css']
})
export class ModalFirmaClaseComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() firmaCompletada = new EventEmitter<void>();

  private bitacoraService = inject(BitacoraService);
  private toastr = inject(ToastrService);

  horariosCoach: string[] = [];
  horarioSeleccionado = '';
  cantidadAlumnos: number | null = null;

  ngOnInit() {
    const guardado = sessionStorage.getItem('horarios_coach_activos') || localStorage.getItem('horarios_coach_permanentes');
    if (guardado) {
      try {
        this.horariosCoach = JSON.parse(guardado);
      } catch {}
    }

    if (this.horariosCoach.length > 0) {
      this.horarioSeleccionado = this.horariosCoach[0];
    }
  }

  seleccionarHorario(horario: string) {
    this.horarioSeleccionado = horario;
  }

  guardarFirma() {
    if (!this.horarioSeleccionado) {
      this.toastr.warning('Selecciona el horario en el que estás trabajando.', 'Falta Horario');
      return;
    }

    if (this.cantidadAlumnos === null || this.cantidadAlumnos <= 0) {
      this.toastr.warning('Ingresa la cantidad de alumnos asistentes.', 'Falta Cantidad');
      return;
    }

    this.bitacoraService.registrarFirmaClase(this.horarioSeleccionado, this.cantidadAlumnos).subscribe({
      next: () => {
        this.toastr.success(`Clase firmada: ${this.cantidadAlumnos} alumnos en ${this.horarioSeleccionado}.`, 'Firma Registrada');
        this.firmaCompletada.emit();
        this.cerrar.emit();
      },
      error: () => {
        this.toastr.error('No se pudo conectar con el servidor.', 'Error');
      }
    });
  }
}
