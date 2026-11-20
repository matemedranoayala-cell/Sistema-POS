import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Datos que muestra una fila del control de acceso (ingreso o resultado de búsqueda). */
export interface FilaAcceso {
  id: number;
  alumnoId: number;
  hora: string;
  nombre: string;
  dni: string;
  plan: string;
  academia: string;
  estado: string;
  /** Solo en resultados de búsqueda. */
  membresiaVigente?: boolean;
  vencimientoMembresia?: string | null;
}

@Component({
  selector: 'app-fila-acceso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fila-acceso.component.html',
  styleUrls: ['./fila-acceso.component.css']
})
export class FilaAccesoComponent {
  @Input({ required: true }) fila!: FilaAcceso;
  /** Muestra el botón "Marcar Ingreso" (resultados de búsqueda). */
  @Input() permitirIngreso = false;
  @Input() procesando = false;
  @Input() deshabilitado = false;
  @Output() verPerfil = new EventEmitter<FilaAcceso>();
  @Output() marcarIngreso = new EventEmitter<FilaAcceso>();

  get tieneDatosMembresia(): boolean {
    return this.fila.membresiaVigente !== undefined;
  }
}
