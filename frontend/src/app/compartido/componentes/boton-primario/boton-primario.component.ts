
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boton-primario',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="tipo"
      [disabled]="deshabilitado"
      (click)="onClick.emit($event)"
      class="boton-base">
      {{ texto }}
    </button>
  `,
  styles: [`
    .boton-base {
      width: 100%;
      padding: 0.875rem 1rem;
      background-color: #111827;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-top: 1rem;
    }
    .boton-base:hover:not([disabled]) { background-color: #1f2937; }
    .boton-base[disabled] { opacity: 0.7; cursor: not-allowed; }
  `]
})
export class BotonPrimarioComponent {
  @Input() texto = 'Aceptar';
  @Input() tipo = 'button';
  @Input() deshabilitado = false;
  @Output() onClick = new EventEmitter<MouseEvent>();
}
