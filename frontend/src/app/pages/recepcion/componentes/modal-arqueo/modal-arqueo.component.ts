import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CierreCajaService } from '../../../../services/cierre-caja.service';
import { VentaService } from '../../../../services/venta.service';

@Component({
  selector: 'app-modal-arqueo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-arqueo.component.html',
  styleUrls: ['./modal-arqueo.component.css']
})
export class ModalArqueoComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();

  private cierreCajaService = inject(CierreCajaService);
  private ventaService = inject(VentaService);
  private toastr = inject(ToastrService);

  efectivoSistema = 0;
  efectivoFisico: number | null = null;
  observaciones = '';

  ngOnInit() {
    this.calcularVentasSistema();
  }

  calcularVentasSistema() {
    this.ventaService.obtenerVentas().subscribe({
      next: (ventas) => {
        const lista = ventas || [];
        this.efectivoSistema = lista.reduce((acc, v) => acc + Number(v.total || 0), 0);
      },
      error: () => {
        this.efectivoSistema = 0;
      }
    });
  }

  confirmarCierre() {
    if (this.efectivoFisico === null || this.efectivoFisico < 0) {
      this.toastr.warning('Ingresa el monto de efectivo físico contado.', 'Falta Monto');
      return;
    }

    const diferencia = this.efectivoFisico - this.efectivoSistema;
    const notaDiferencia = diferencia === 0
      ? 'Cuadre exacto'
      : (diferencia > 0 ? `Sobrante: Bs ${diferencia}` : `Faltante: Bs ${Math.abs(diferencia)}`);

    const obsFinal = this.observaciones.trim()
      ? `${this.observaciones.trim()} (${notaDiferencia})`
      : notaDiferencia;

    this.cierreCajaService.registrarCierre({
      total_ingresos: Number(this.efectivoFisico),
      observaciones: obsFinal
    }).subscribe({
      next: () => {
        this.toastr.success(`Arqueo registrado por Bs ${this.efectivoFisico}.`, 'Cierre de Turno');
        this.cerrar.emit();
      },
      error: () => {
        this.toastr.error('No se pudo guardar el arqueo en el servidor.', 'Error');
      }
    });
  }
}
