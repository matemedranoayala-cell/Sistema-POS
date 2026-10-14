import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tarjeta-accion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-accion.component.html',
  styleUrls: ['./tarjeta-accion.component.css']
})
export class TarjetaAccionComponent {
  @Input() titulo = '';
  @Input() subtitulo = '';
  @Input() colorFondo = '#f3f4f6';
  @Input() colorTexto = '#374151';
  @Input() activa = false;

  @Output() clickTarjeta = new EventEmitter<void>();
}
