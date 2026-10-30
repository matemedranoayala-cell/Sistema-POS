import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-reportes-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-reportes-tienda.component.html'
})
export class ModalReportesTiendaComponent implements OnInit {
  @Input() categorias: string[] = [];
  @Input() fechaMaximaVisible = '';
  @Output() cerrar = new EventEmitter<void>();
  @Output() exportar = new EventEmitter<{ categoria: string; fechaInicio: string; fechaFin: string }>();

  categoria = 'todas';
  fechaInicio = '';
  fechaFin = '';

  ngOnInit() {
    this.fechaInicio = this.fechaMaximaVisible;
    this.fechaFin = this.fechaMaximaVisible;
  }

  dispararExportacion() {
    this.exportar.emit({
      categoria: this.categoria,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    });
  }
}
