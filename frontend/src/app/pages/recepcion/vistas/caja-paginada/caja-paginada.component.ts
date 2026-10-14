import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion.component';
import { VentaService } from '../../../../services/venta.service';

@Component({
  selector: 'app-caja-paginada',
  standalone: true,
  imports: [CommonModule, PaginacionComponent],
  templateUrl: './caja-paginada.component.html'
})
export class CajaPaginadaComponent implements OnInit {
  @Output() volver = new EventEmitter<void>();
  private ventaService = inject(VentaService);

  transacciones: any[] = [];
  transaccionesPaginadas: any[] = [];
  paginaActual = 1;
  itemsPorPagina = 4;

  ngOnInit() {
    this.ventaService.obtenerVentas().subscribe({
      next: (data) => {
        this.transacciones = (data || []).map(v => ({
          concepto: `Transacción #${v.id} - Recepción`,
          metodo: v.metodo_pago || 'Efectivo',
          hora: v.hora || 'Hoy',
          monto: `Bs ${v.total}`
        }));
        this.actualizarPaginacion(1);
      },
      error: () => {
        this.actualizarPaginacion(1);
      }
    });
  }

  actualizarPaginacion(pagina: number) {
    this.paginaActual = pagina;
    const inicio = (pagina - 1) * this.itemsPorPagina;
    this.transaccionesPaginadas = this.transacciones.slice(inicio, inicio + this.itemsPorPagina);
  }
}
