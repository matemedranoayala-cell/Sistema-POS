import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { BarraSuperiorCoachComponent } from '../componentes/barra-superior-coach/barra-superior-coach.component';
import { TarjetaAccionComponent } from '../../../compartido/componentes/tarjeta-accion/tarjeta-accion.component';
import { HorariosPaginadosComponent } from '../componentes/horarios-paginados/horarios-paginados.component';
import { ModalFirmaClaseComponent } from '../componentes/modal-firma-clase/modal-firma-clase.component';
import { ModalReporteDanoComponent } from '../componentes/modal-reporte-dano/modal-reporte-dano.component';
import { ModalMisHorariosComponent } from '../componentes/modal-mis-horarios/modal-mis-horarios.component';
import { BitacoraService } from '../../../services/bitacora.service';

@Component({
  selector: 'app-inicio-coach',
  standalone: true,
  imports: [
    CommonModule,
    BarraSuperiorCoachComponent,
    TarjetaAccionComponent,
    HorariosPaginadosComponent,
    ModalFirmaClaseComponent,
    ModalReporteDanoComponent,
    ModalMisHorariosComponent
  ],
  templateUrl: './inicio-coach.component.html',
  styleUrls: ['./inicio-coach.component.css']
})
export class InicioCoachComponent implements OnInit {
  private bitacoraService = inject(BitacoraService);
  private toastr = inject(ToastrService);

  claseActiva = false;
  mostrarModalFirma = false;
  mostrarModalReporte = false;
  mostrarModalMisHorarios = false;

  ngOnInit() {
    const permanente = localStorage.getItem('horarios_coach_permanentes');
    const sesion = sessionStorage.getItem('horarios_coach_activos');
    if (!permanente && !sesion) {
      this.mostrarModalMisHorarios = true;
    }
  }

  toggleClase() {
    const activo = sessionStorage.getItem('horarios_coach_activos') || localStorage.getItem('horarios_coach_permanentes');
    if (!activo) {
      this.toastr.info('Selecciona primero tus horarios asignados.', 'Mis Horarios');
      this.mostrarModalMisHorarios = true;
      return;
    }

    if (!this.claseActiva) {
      this.claseActiva = true;
      this.bitacoraService.registrarEvento(
        'Inicio de Clase',
        'Tatami / Entrenamiento',
        'El entrenador inició sesión de clase en tatami.'
      ).subscribe();
      this.toastr.success('Clase en curso. Al terminar, registra la Firma de Clase.', 'Clase Iniciada');
    } else {
      this.mostrarModalFirma = true;
    }
  }

  abrirFirma() {
    if (!this.claseActiva) {
      this.toastr.warning('Debes iniciar la clase antes de firmarla.', 'Clase No Iniciada');
      return;
    }
    this.mostrarModalFirma = true;
  }

  abrirReporte() {
    this.mostrarModalReporte = true;
  }
}
