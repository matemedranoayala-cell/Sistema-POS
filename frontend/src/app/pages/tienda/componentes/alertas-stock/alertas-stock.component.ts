import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alertas-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas-stock.component.html'
})
export class AlertasStockComponent {
  @Input() inventarioCritico: any[] = [];
  @Input() umbralStockBajo = 5;
  @Input() cargando = false;
  @Output() reponer = new EventEmitter<any>();
}
