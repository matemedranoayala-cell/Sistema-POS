import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlumnoService } from '../../../services/alumno.service';
import { RenovacionService } from '../../../services/renovacion.service';
import { ProductoService } from '../../../services/producto.service';
import { VentaProductoService } from '../../../services/venta-producto.service';
import { CierreCajaService } from '../../../services/cierre-caja.service';
import { BusquedaAlumnosService } from '../../../services/busqueda-alumnos.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.css']
})
export class QuickActionsComponent implements OnInit {
  private alumnoService = inject(AlumnoService);
  private renovacionService = inject(RenovacionService);
  private productoService = inject(ProductoService);
  private ventaProductoService = inject(VentaProductoService);
  private cierreCajaService = inject(CierreCajaService);
  private busquedaAlumnosService = inject(BusquedaAlumnosService);

  showInscripcionModal = false;
  showRenovacionModal = false;
  showVentaModal = false;
  showCajaModal = false;

  inscripcionData = { nombres: '', ci: '', telefono: '', fechaNacimiento: '', disciplina: '', duracion: '1', pago: 'efectivo' };
  renovacionData = { alumnoBusqueda: '', disciplina: 'mma', duracion: '1', pagor: 'efectivo' };
  ventaData = { producto: '' as number | '', cantidad: 1, pagov: 'efectivo' };
  cajaData = { observaciones: '' };
  productos: any[] = [];

  precioBaseMensual = 350;

  ngOnInit(): void {
    this.productoService.obtenerProductos().subscribe({
      next: productos => this.productos = productos
    });
  }

  abrirInscripcion() { this.showInscripcionModal = true; }
  abrirRenovacion() { this.showRenovacionModal = true; }
  abrirVenta() { this.showVentaModal = true; }
  abrirCaja() { this.showCajaModal = true; }

  cerrarModales() {
    this.showInscripcionModal = false;
    this.showRenovacionModal = false;
    this.showVentaModal = false;
    this.showCajaModal = false;
  }

  calcularTotalInscripcion(): number {
    const meses = parseInt(this.inscripcionData.duracion, 10);
    let descuento = 0;

    if (meses === 3) descuento = 0.10;
    if (meses === 6) descuento = 0.15;
    if (meses === 12) descuento = 0.20;

    return (this.precioBaseMensual * meses) * (1 - descuento);
  }

  calcularTotalRenovacion(): number {
    const meses = parseInt(this.renovacionData.duracion, 10);
    let descuento = 0;

    if (meses === 3) descuento = 0.10;
    if (meses === 6) descuento = 0.15;
    if (meses === 12) descuento = 0.20;

    return (this.precioBaseMensual * meses) * (1 - descuento);
  }

  guardarInscripcion() {
    this.alumnoService.inscribirAlumno({
      nombres: this.inscripcionData.nombres,
      dni: this.inscripcionData.ci,
      telefono: this.inscripcionData.telefono,
      disciplina: this.inscripcionData.disciplina,
      plan_id: Number(this.inscripcionData.duracion),
      metodoPago: this.inscripcionData.pago === 'qr' ? 'QR / Transferencia' : 'Efectivo'
    }).subscribe({
      next: () => { alert('¡Inscripción registrada con éxito!'); this.cerrarModales(); },
      error: error => alert(error.error?.error || 'No se pudo registrar la inscripción.')
    });
  }

  guardarRenovacion() {
    const termino = this.renovacionData.alumnoBusqueda.trim();
    const criterio = /^\d+$/.test(termino) ? 'ci' : 'nombre';
    this.busquedaAlumnosService.buscar(criterio, termino).subscribe({
      next: alumnos => {
        const alumno = alumnos[0];
        if (!alumno) {
          alert('No se encontró el alumno.');
          return;
        }
        const meses = Number(this.renovacionData.duracion);
        const vencimiento = new Date();
        vencimiento.setMonth(vencimiento.getMonth() + meses);
        this.renovacionService.registrarRenovacion({
          alumno: alumno.id,
          dni: alumno.dni,
          plan_id: meses,
          monto: this.calcularTotalRenovacion(),
          metodo_pago: this.renovacionData.pagor === 'qr' ? 'QR / Transferencia' : 'Efectivo',
          proximo_vencimiento: vencimiento.toISOString().slice(0, 10)
        }).subscribe({
          next: () => { alert('¡Membresía renovada!'); this.cerrarModales(); },
          error: error => alert(error.error?.error || 'No se pudo renovar la membresía.')
        });
      },
      error: error => alert(error.error?.error || 'No se pudo buscar el alumno.')
    });
  }

  guardarVenta() {
    if (!this.ventaData.producto) {
      alert('Selecciona un producto.');
      return;
    }
    this.ventaProductoService.vender(Number(this.ventaData.producto), Number(this.ventaData.cantidad)).subscribe({
      next: () => { alert('¡Venta registrada!'); this.cerrarModales(); },
      error: error => alert(error.error?.error || 'No se pudo registrar la venta.')
    });
  }

  guardarCaja() {
    this.cierreCajaService.registrarCierre({
      total_ingresos: 3550,
      observaciones: this.cajaData.observaciones
    }).subscribe({
      next: () => { alert('¡Arqueo de caja guardado!'); this.cerrarModales(); },
      error: error => alert(error.error?.error || 'No se pudo guardar el arqueo.')
    });
  }
}
