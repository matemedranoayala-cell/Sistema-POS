import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-inventario.component.html'
})
export class ModalInventarioComponent {
  @Input() catalogo: any[] = [];
  @Input() umbralStockBajo = 5;
  @Input() productoInicialAjuste: any = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardarStock = new EventEmitter<{ producto: any; modo: 'agregar' | 'fijar'; cantidad: number }>();

  private toastr = inject(ToastrService);

  productoSeleccionado: any = null;
  modoAjuste: 'agregar' | 'fijar' = 'agregar';
  cantidadAjuste: number | null = null;

  ngOnInit() {
    if (this.productoInicialAjuste) {
      this.abrirSubModal(this.productoInicialAjuste, 'agregar');
    }
  }

  abrirSubModal(prod: any, modo: 'agregar' | 'fijar') {
    this.productoSeleccionado = prod;
    this.modoAjuste = modo;
    this.cantidadAjuste = modo === 'fijar' ? prod.stock : null;
  }

  confirmarAjuste() {
    if (!this.productoSeleccionado) return;
    const n = Number(this.cantidadAjuste);
    const minimo = this.modoAjuste === 'agregar' ? 1 : 0;
    if (this.cantidadAjuste === null || !Number.isInteger(n) || n < minimo) {
      // El formulario queda abierto para corregir el valor.
      this.toastr.warning(
        this.modoAjuste === 'agregar'
          ? 'Ingresa un número entero de unidades mayor a 0.'
          : 'Ingresa el stock contado (número entero, 0 o más).',
        'Cantidad Inválida'
      );
      return;
    }
    this.guardarStock.emit({
      producto: this.productoSeleccionado,
      modo: this.modoAjuste,
      cantidad: n
    });
    this.productoSeleccionado = null;
  }
}
