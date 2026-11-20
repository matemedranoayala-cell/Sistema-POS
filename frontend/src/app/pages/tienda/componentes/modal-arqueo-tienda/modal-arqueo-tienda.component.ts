import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-arqueo-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-arqueo-tienda.component.html'
})
export class ModalArqueoTiendaComponent {
  @Input() ventasTurno = 0;
  @Input() guardando = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmarArqueo = new EventEmitter<number>();

  private toastr = inject(ToastrService);

  montoFisico: number | null = null;

  get diferencia(): number | null {
    if (this.montoFisico === null || this.montoFisico === undefined) return null;
    return Math.round((Number(this.montoFisico) - this.ventasTurno) * 100) / 100;
  }

  guardar() {
    if (this.guardando) return;
    const monto = Number(this.montoFisico);
    if (this.montoFisico === null || this.montoFisico === undefined || isNaN(monto)) {
      this.toastr.warning('Ingresa el efectivo físico contado en el cajón.', 'Falta Monto');
      return;
    }
    if (monto < 0) {
      this.toastr.warning('El monto no puede ser negativo.', 'Monto Inválido');
      return;
    }
    this.confirmarArqueo.emit(monto);
  }
}
