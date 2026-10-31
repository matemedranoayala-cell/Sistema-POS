import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion.component';

@Component({
  selector: 'app-transacciones-tienda',
  standalone: true,
  imports: [CommonModule, PaginacionComponent],
  templateUrl: './transacciones-tienda.component.html'
})
export class TransaccionesTiendaComponent {
  @Input() ventasRecientes: any[] = [];
  @Input() todasLasVentas: any[] = [];
  @Input() totalVentas = 0;
  @Input() cargando = false;
  @Input() pagoEnProcesoId: number | null = null;
  @Output() reenviarWhatsApp = new EventEmitter<any>();
  @Output() marcarPagada = new EventEmitter<{
    ventaId: number;
    metodoPago: 'Efectivo' | 'QR / Transferencia';
  }>();

  mostrarHistorial = false;
  paginaActual = 1;
  readonly itemsPorPagina = 5;

  get ventasVisibles(): any[] {
    return this.ventasRecientes.slice(0, 5);
  }

  get ventasPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.todasLasVentas.slice(inicio, inicio + this.itemsPorPagina);
  }

  abrirHistorial(): void {
    this.paginaActual = 1;
    this.mostrarHistorial = true;
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
  }
}
