import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.css']
})
export class QuickActionsComponent {
  showInscripcionModal = false;
  showRenovacionModal = false;
  showVentaModal = false;
  showCajaModal = false;

  inscripcionData = { nombres: '', ci: '', telefono: '', fechaNacimiento: '', disciplina: '', duracion: '1', pago: 'efectivo' };
  renovacionData = { alumnoBusqueda: '', disciplina: 'mma', duracion: '1', pagor: 'efectivo' };
  ventaData = { producto: '', cantidad: 1, pagov: 'efectivo' };
  cajaData = { observaciones: '' };

  precioBaseMensual = 350;

  constructor(private http: HttpClient) {}

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
    this.http.post('http://127.0.0.1:8000/api/inscripciones/', this.inscripcionData).subscribe({
      next: () => { alert('¡Inscripción registrada con éxito!'); this.cerrarModales(); },
      error: () => { alert('Petición enviada. Revisa la pestaña Red para ver la respuesta de Django.'); this.cerrarModales(); }
    });
  }

  guardarRenovacion() {
    this.http.post('http://127.0.0.1:8000/api/renovaciones/', this.renovacionData).subscribe({
      next: () => { alert('¡Membresía renovada!'); this.cerrarModales(); },
      error: () => { alert('Petición enviada. Revisa la pestaña Red.'); this.cerrarModales(); }
    });
  }

  guardarVenta() {
    this.http.post('http://127.0.0.1:8000/api/ventas/', this.ventaData).subscribe({
      next: () => { alert('¡Venta registrada!'); this.cerrarModales(); },
      error: () => { alert('Petición enviada. Revisa la pestaña Red.'); this.cerrarModales(); }
    });
  }

  guardarCaja() {
    this.http.post('http://127.0.0.1:8000/api/caja/cierre/', this.cajaData).subscribe({
      next: () => { alert('¡Arqueo de caja guardado!'); this.cerrarModales(); },
      error: () => { alert('Petición enviada. Revisa la pestaña Red.'); this.cerrarModales(); }
    });
  }
}
