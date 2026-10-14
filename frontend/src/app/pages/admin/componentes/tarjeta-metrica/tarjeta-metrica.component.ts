import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tarjeta-metrica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-metrica.component.html'
})
export class TarjetaMetricaComponent {
  @Input() titulo: string = '';
  @Input() valor: string = '';
  @Input() alerta: boolean = false;

  @Output() abrir = new EventEmitter<void>();
}
