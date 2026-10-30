import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-arqueo-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-arqueo-tienda.component.html'
})
export class ModalArqueoTiendaComponent {
  @Input() ventasTurno = 0;
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmarArqueo = new EventEmitter<number>();

  montoFisico: number | null = null;

  get diferencia(): number | null {
    if (this.montoFisico === null || this.montoFisico === undefined) return null;
    return Math.round((Number(this.montoFisico) - this.ventasTurno) * 100) / 100;
  }

  guardar() {
    if (this.montoFisico === null || this.montoFisico < 0) return;
    this.confirmarArqueo.emit(Number(this.montoFisico));
  }
}
