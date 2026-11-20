import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ArqueoCaja, SuperadminService } from '../../../../services/superadmin.service';

@Component({
  selector: 'app-revision-arqueos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revision-arqueos.component.html',
  styleUrls: ['../../superadmin-compartido.css', './revision-arqueos.component.css']
})
export class RevisionArqueosComponent implements OnInit {
  /** Avisa al panel para refrescar el contador de pendientes. */
  @Output() revisado = new EventEmitter<void>();

  private superadminService = inject(SuperadminService);
  private toastr = inject(ToastrService);

  arqueos: ArqueoCaja[] = [];
  cargando = false;
  errorCarga = false;
  verRevisados = false;

  revisandoId: number | null = null;
  observandoId: number | null = null;
  nota = '';

  ngOnInit(): void {
    this.cargar();
  }

  get pendientes(): ArqueoCaja[] {
    return this.arqueos.filter(a => a.estado === 'Pendiente');
  }

  get visibles(): ArqueoCaja[] {
    return this.verRevisados ? this.arqueos : this.pendientes;
  }

  cargar(): void {
    this.cargando = true;
    this.superadminService.listarArqueos().subscribe({
      next: arqueos => {
        this.arqueos = arqueos;
        this.cargando = false;
        this.errorCarga = false;
      },
      error: () => {
        this.cargando = false;
        this.errorCarga = true;
      }
    });
  }

  /** Lee la diferencia que el cierre de tienda escribe en las observaciones. */
  diferencia(arqueo: ArqueoCaja): { texto: string; color: string } | null {
    const obs = arqueo.observaciones;
    const faltante = obs.match(/Faltante: Bs ([\d.]+)/);
    if (faltante) return { texto: `Faltante Bs ${faltante[1]}`, color: 'red' };
    const sobrante = obs.match(/Sobrante: Bs ([\d.]+)/);
    if (sobrante) return { texto: `Sobrante Bs ${sobrante[1]}`, color: 'orange' };
    if (obs.includes('Cuadre exacto')) return { texto: 'Cuadre exacto', color: 'green' };
    return null;
  }

  iniciarObservacion(arqueo: ArqueoCaja): void {
    this.observandoId = arqueo.id;
    this.nota = '';
  }

  cancelarObservacion(): void {
    this.observandoId = null;
    this.nota = '';
  }

  revisar(arqueo: ArqueoCaja, decision: 'Verificado' | 'Observado'): void {
    if (this.revisandoId !== null) return;
    const nota = decision === 'Observado' ? this.nota.trim() : '';
    if (decision === 'Observado' && !nota) {
      this.toastr.warning('Escribe qué está mal en este arqueo.', 'Falta la nota');
      return;
    }

    this.revisandoId = arqueo.id;
    this.superadminService.revisarArqueo(arqueo.id, decision, nota).subscribe({
      next: actualizado => {
        this.revisandoId = null;
        this.cancelarObservacion();
        this.arqueos = this.arqueos.map(a => (a.id === actualizado.id ? actualizado : a));
        this.toastr.success(`Arqueo #${arqueo.id} marcado como ${decision}.`, 'Arqueo revisado');
        this.revisado.emit();
      },
      error: err => {
        this.revisandoId = null;
        this.toastr.error(err?.error?.error ?? 'No se pudo guardar la revisión.', 'Error');
        this.cargar();
      }
    });
  }
}
