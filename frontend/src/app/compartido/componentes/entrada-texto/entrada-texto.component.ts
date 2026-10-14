
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-entrada-texto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grupo-entrada">
      <label *ngIf="etiqueta">{{ etiqueta }}</label>
      <input
        [type]="tipo"
        [placeholder]="marcador"
        [ngModel]="valor"
        (ngModelChange)="cambioValor($event)"
        class="entrada-base"
      />
    </div>
  `,
  styles: [`
    .grupo-entrada { display: flex; flex-direction: column; margin-bottom: 1.2rem; }
    label { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
    .entrada-base {
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;
      background-color: #f9fafb;
    }
    .entrada-base:focus { border-color: #111827; box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1); background-color: #ffffff; }
  `]
})
export class EntradaTextoComponent {
  @Input() etiqueta = '';
  @Input() marcador = '';
  @Input() tipo = 'text';
  @Input() valor = '';
  @Output() valorChange = new EventEmitter<string>();

  cambioValor(nuevoValor: string) {
    this.valor = nuevoValor;
    this.valorChange.emit(this.valor);
  }
}
