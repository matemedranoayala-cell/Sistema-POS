import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  fechaActual = 'Sunday, September 27, 2026';
  usuarioActual = 'Administrador Operativo';

  resumen = {
    ingresosHoy: 4250,
    ocupacionTotal: 65,
    alertasPendientes: 2
  };

  supervisionCoaches = [
    { nombre: 'Marcos (Muay Thai)', estado: 'En Clase', area: 'Tatami A', color: 'blue' },
    { nombre: 'Silva (Boxeo)', estado: 'Descanso', area: 'N/A', color: 'orange' },
    { nombre: 'Diego (Libre)', estado: 'Clase Finalizada', area: 'Octágono', color: 'green' }
  ];

  logsRecepcion = [
    { operacion: 'Arqueo Parcial', usuario: 'Recepción - Turno Tarde', monto: 'Bs 1200', hora: '18:30', estado: 'Cuadrado', color: 'green', detalle: 'Cierre de caja de medio turno sin novedades.' },
    { operacion: 'Anulación Membresía', usuario: 'Recepción - Turno Tarde', monto: 'Bs 250', hora: '19:15', estado: 'Requiere Firma', color: 'red', detalle: 'Cliente solicitó devolución por lesión comprobada. Requiere firma de gerencia.' },
    { operacion: 'Cierre de Caja', usuario: 'Tienda Kiosko', monto: 'Bs 430', hora: '21:00', estado: 'Pendiente', color: 'orange', detalle: 'A la espera de validación física del efectivo contra el sistema.' }
  ];

  mostrarModalExportar = false;
  mostrarModalLog = false;
  logSeleccionado: any = null;

  exportarForm!: FormGroup;
  fechaMaximaVisible = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    const hoy = new Date();
    this.fechaMaximaVisible = hoy.toISOString().split('T')[0];

    this.exportarForm = this.fb.group({
      tipoReporte: ['financiero', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });
  }

  abrirModalExportar() {
    this.mostrarModalExportar = true;
  }

  abrirModalLog(log: any) {
    this.logSeleccionado = log;
    this.mostrarModalLog = true;
  }

  cerrarModales() {
    this.mostrarModalExportar = false;
    this.mostrarModalLog = false;
    this.logSeleccionado = null;
    this.exportarForm.reset({ tipoReporte: 'financiero' });
  }

  generarReporte() {
    if (this.exportarForm.valid) {
      alert('Generando reporte gerencial consolidado...');
      this.cerrarModales();
    } else {
      Object.keys(this.exportarForm.controls).forEach(key => this.exportarForm.get(key)?.markAsTouched());
    }
  }

  autorizarOperacion() {
    alert(`Operación "${this.logSeleccionado.operacion}" autorizada exitosamente.`);
    this.logSeleccionado.estado = 'Autorizado';
    this.logSeleccionado.color = 'green';
    this.cerrarModales();
  }
}
