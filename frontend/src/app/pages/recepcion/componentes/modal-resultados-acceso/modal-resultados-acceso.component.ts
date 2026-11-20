import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CriterioBusqueda } from '../../../../services/busqueda-alumnos.service';
import { FilaAcceso, FilaAccesoComponent } from '../fila-acceso/fila-acceso.component';

@Component({
  selector: 'app-modal-resultados-acceso',
  standalone: true,
  imports: [CommonModule, FilaAccesoComponent],
  templateUrl: './modal-resultados-acceso.component.html',
  styleUrls: ['./modal-resultados-acceso.component.css']
})
export class ModalResultadosAccesoComponent {
  @Input({ required: true }) resultados: FilaAcceso[] = [];
  @Input() criterio: CriterioBusqueda = 'ci';
  @Input() termino = '';
  @Input() registrandoId: number | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() marcarIngreso = new EventEmitter<FilaAcceso>();
  @Output() verPerfil = new EventEmitter<FilaAcceso>();

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    // Si hay un popup de confirmación abierto, Escape lo cierra a él primero.
    if (!document.querySelector('.swal2-container')) this.cerrar.emit();
  }
}
