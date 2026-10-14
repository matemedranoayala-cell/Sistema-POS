import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AlumnoService } from '../../../../services/alumno.service';
import { AsistenciaService } from '../../../../services/asistencia.service';
import { VentaService } from '../../../../services/venta.service';
import { BitacoraService } from '../../../../services/bitacora.service';

@Component({
  selector: 'app-modal-open-mat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-open-mat.component.html',
  styleUrls: ['./modal-open-mat.component.css']
})
export class ModalOpenMatComponent {
  @Output() cerrar = new EventEmitter<void>();

  private alumnoService = inject(AlumnoService);
  private asistenciaService = inject(AsistenciaService);
  private ventaService = inject(VentaService);
  private bitacoraService = inject(BitacoraService);
  private toastr = inject(ToastrService);

  visitante = {
    nombre: '',
    dni: '',
    pago: 30,
    academia: ''
  };

  generarPase() {
    if (!this.visitante.nombre.trim() || !this.visitante.dni.trim() || !this.visitante.pago || this.visitante.pago <= 0) {
      this.toastr.warning('Completa el nombre, CI y monto del visitante.', 'Datos Incompletos');
      return;
    }

    const academiaFinal = this.visitante.academia.trim() || 'Visitante Open Mat';

    this.alumnoService.inscribirAlumno({
      nombres: this.visitante.nombre.trim(),
      apellidos: '',
      dni: this.visitante.dni.trim(),
      disciplina: 'Open Mat',
      plan: 1,
      esCompetidor: false,
      academiaOrigen: academiaFinal
    }).subscribe({
      next: (nuevoAlumno) => {
        if (nuevoAlumno && nuevoAlumno.id) {
          this.asistenciaService.marcarIngreso({
            alumno: nuevoAlumno.id,
            estado_acceso: 'Permitido'
          }).subscribe();
        }

        this.ventaService.registrarVenta({
          total: Number(this.visitante.pago),
          metodo_pago: 'Efectivo'
        }).subscribe();

        this.bitacoraService.registrarEvento(
          'Pase Diario / Open Mat',
          'Recepción / Caja',
          `Visitante: ${this.visitante.nombre} (CI: ${this.visitante.dni}) - Academia: ${academiaFinal} - Pago: Bs ${this.visitante.pago}`
        ).subscribe();

        this.toastr.success(`Pase Open Mat generado para ${this.visitante.nombre}.`, 'Ingreso Registrado');
        this.cerrar.emit();
      },
      error: () => {
        this.toastr.error('No se pudo registrar el pase en el servidor.', 'Error');
      }
    });
  }
}
