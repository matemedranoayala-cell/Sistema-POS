import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transacciones-tienda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transacciones-tienda.component.html'
})
export class TransaccionesTiendaComponent {
  @Input() ventasRecientes: any[] = [];
  @Input() cargando = false;
  @Output() reenviarWhatsApp = new EventEmitter<any>();
}
