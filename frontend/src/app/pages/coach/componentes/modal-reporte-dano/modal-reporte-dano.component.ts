import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ReporteEquipoService } from '../../../../services/reporte-equipo.service';

@Component({
  selector: 'app-modal-reporte-dano',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-reporte-dano.component.html',
  styleUrls: ['./modal-reporte-dano.component.css']
})
export class ModalReporteDanoComponent {
  @Output() cerrar = new EventEmitter<void>();

  private reporteService = inject(ReporteEquipoService);
  private toastr = inject(ToastrService);

  equipo = '';
  estado_danio = 'Leve';
  descripcion = '';

  guardarReporte() {
    if (!this.equipo.trim() || !this.descripcion.trim()) {
      this.toastr.warning('Completa el equipo y la descripción del daño.', 'Datos Incompletos');
      return;
    }

    this.reporteService.enviarReporte({
      equipo: this.equipo,
      estado_danio: this.estado_danio,
      descripcion: this.descripcion
    }).subscribe({
      next: () => {
        this.toastr.success('Reporte de daño registrado en el sistema.', 'Reporte Enviado');
        this.cerrar.emit();
      },
      error: () => {
        this.toastr.error('Error al registrar el reporte en el servidor.', 'Error');
      }
    });
  }
}
