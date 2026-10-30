import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    if (!this.productoSeleccionado || this.cantidadAjuste === null) return;
    this.guardarStock.emit({
      producto: this.productoSeleccionado,
      modo: this.modoAjuste,
      cantidad: Number(this.cantidadAjuste)
    });
    this.productoSeleccionado = null;
  }
}
