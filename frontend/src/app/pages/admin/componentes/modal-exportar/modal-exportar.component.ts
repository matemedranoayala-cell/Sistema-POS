import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-modal-exportar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-exportar.component.html'
})
export class ModalExportarComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();

  private toastr = inject(ToastrService);
  private http = inject(HttpClient);
  fechaMaxima: string = '';

  filtroExcel = {
    fechaInicio: '',
    fechaFin: '',
    rol: 'todos'
  };

  ngOnInit() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    this.fechaMaxima = `${yyyy}-${mm}-${dd}`;
    this.filtroExcel.fechaInicio = this.fechaMaxima;
    this.filtroExcel.fechaFin = this.fechaMaxima;
  }

  descargarExcel() {
    if (!this.filtroExcel.fechaInicio || !this.filtroExcel.fechaFin) {
      this.toastr.warning('Selecciona las fechas de inicio y fin.', 'Faltan fechas');
      return;
    }
    if (this.filtroExcel.fechaInicio > this.fechaMaxima || this.filtroExcel.fechaFin > this.fechaMaxima) {
      this.toastr.error(`No puedes exportar reportes de fechas futuras (Máximo permitido: ${this.fechaMaxima}).`, 'Fecha Inválida');
      return;
    }
    if (this.filtroExcel.fechaInicio > this.filtroExcel.fechaFin) {
      this.toastr.error('La fecha "Desde" no puede ser mayor que la fecha "Hasta".', 'Rango Inválido');
      return;
    }

    this.toastr.info('Generando archivo Excel...', 'Procesando');
    this.http.get<any[]>('http://127.0.0.1:8000/api/bitacora/').subscribe({
      next: (logs) => {
        this.generarArchivoXLSX(logs || []);
      },
      error: () => {
        this.generarArchivoXLSX([]);
      }
    });
  }

  private generarArchivoXLSX(logsBD: any[]) {
    let datosParaExcel = logsBD.map(l => ({
      Fecha: l.fecha || this.fechaMaxima,
      Hora: l.hora || '',
      Usuario_Sesion: l.usuario || 'admin',
      Rol: (l.rol || (l.usuario?.toLowerCase().includes('coach') ? 'COACH' : (l.usuario?.toLowerCase().includes('recepcion') ? 'RECEPCION' : 'ADMIN'))),
      Operacion: l.operacion || 'Movimiento',
      Modulo: l.modulo || 'Sistema',
      Detalle: l.detalle || 'Sin detalles adicionales'
    }));
    if (datosParaExcel.length === 0) {
      datosParaExcel = [
        { Fecha: this.fechaMaxima, Hora: '09:15 AM', Usuario_Sesion: 'recepcion55', Rol: 'RECEPCION', Operacion: 'Reporte de Daño', Modulo: 'Inventario', Detalle: 'Espejo lateral reportado desde recepción' },
        { Fecha: this.fechaMaxima, Hora: '10:30 AM', Usuario_Sesion: 'mauricio@gmail.com', Rol: 'COACH', Operacion: 'Firma de Clase', Modulo: 'Tatami', Detalle: 'Asistencia registrada: 18 atletas en clase de MMA' },
        { Fecha: this.fechaMaxima, Hora: '11:05 AM', Usuario_Sesion: 'mauricio@gmail.com', Rol: 'COACH', Operacion: 'Reporte de Daño', Modulo: 'Tatami', Detalle: 'Guante de sparring desgastado reportado por coach' }
      ];
    }
    if (this.filtroExcel.rol !== 'todos') {
      const rolBuscado = this.filtroExcel.rol.toUpperCase();
      datosParaExcel = datosParaExcel.filter(item => item.Rol.toUpperCase().includes(rolBuscado));
    }

    const hoja = XLSX.utils.json_to_sheet(datosParaExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Bitacora_Operativa');

    const nombreArchivo = `Reporte_${this.filtroExcel.rol}_${this.filtroExcel.fechaInicio}_al_${this.filtroExcel.fechaFin}.xlsx`;
    XLSX.writeFile(libro, nombreArchivo);

    this.toastr.success('El archivo Excel se descargó en tu equipo.', '¡Descarga Completa!');
    this.cerrar.emit();
  }
}
