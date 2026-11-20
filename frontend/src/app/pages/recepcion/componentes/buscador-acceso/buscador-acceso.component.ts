import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CriterioBusqueda } from '../../../../services/busqueda-alumnos.service';

@Component({
  selector: 'app-buscador-acceso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador-acceso.component.html',
  styleUrls: ['./buscador-acceso.component.css']
})
export class BuscadorAccesoComponent {
  @Input() buscando = false;
  @Output() buscar = new EventEmitter<{ criterio: CriterioBusqueda; termino: string }>();
  @Output() criterioCambiado = new EventEmitter<CriterioBusqueda>();

  criterio: CriterioBusqueda = 'ci';
  termino = '';

  get placeholder(): string {
    return this.criterio === 'ci'
      ? 'Escanear credencial o escribir el CI...'
      : 'Escribir nombre y/o apellido...';
  }

  seleccionarCriterio(criterio: CriterioBusqueda): void {
    if (criterio === this.criterio) return;
    this.criterio = criterio;
    this.termino = '';
    this.criterioCambiado.emit(criterio);
  }

  enviar(): void {
    if (this.buscando) return;
    this.buscar.emit({ criterio: this.criterio, termino: this.termino.trim() });
  }

  limpiar(): void {
    this.termino = '';
  }
}
