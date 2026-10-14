import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarraSuperiorComponent } from '../../../compartido/componentes/barra-superior/barra-superior.component';
import { TarjetaAccionComponent } from '../../../compartido/componentes/tarjeta-accion/tarjeta-accion.component';
import { TorniqueteMiniComponent } from '../componentes/torniquete-mini/torniquete-mini.component';
import { DirectorioPaginadoComponent } from '../vistas/directorio-paginado/directorio-paginado.component';
import { CajaPaginadaComponent } from '../vistas/caja-paginada/caja-paginada.component';
import { HistorialTorniqueteComponent } from '../vistas/historial-torniquete/historial-torniquete.component';
import { ModalNuevoAlumnoComponent } from '../componentes/modal-nuevo-alumno/modal-nuevo-alumno.component';
import { ModalRenovarComponent } from '../componentes/modal-renovar/modal-renovar.component';
import { ModalOpenMatComponent } from '../componentes/modal-open-mat/modal-open-mat.component';
import { ModalArqueoComponent } from '../componentes/modal-arqueo/modal-arqueo.component';

@Component({
  selector: 'app-inicio-recepcion',
  standalone: true,
  imports: [
    CommonModule,
    BarraSuperiorComponent,
    TarjetaAccionComponent,
    TorniqueteMiniComponent,
    DirectorioPaginadoComponent,
    CajaPaginadaComponent,
    HistorialTorniqueteComponent,
    ModalNuevoAlumnoComponent,
    ModalRenovarComponent,
    ModalOpenMatComponent,
    ModalArqueoComponent
  ],
  templateUrl: './inicio-recepcion.component.html',
  styleUrls: ['./inicio-recepcion.component.css']
})
export class InicioRecepcionComponent {
  @ViewChild(TorniqueteMiniComponent) torniquete!: TorniqueteMiniComponent;

  vistaActual = 'dashboard';
  tarjetaActiva = '';

  mostrarModalAlumno = false;
  mostrarModalRenovar = false;
  mostrarModalOpenMat = false;
  mostrarModalArqueo = false;

  seleccionarTarjeta(tipo: string) {
    this.tarjetaActiva = tipo;
    if (tipo === 'nuevo-alumno') {
      this.mostrarModalAlumno = true;
    } else if (tipo === 'renovar') {
      this.mostrarModalRenovar = true;
    } else if (tipo === 'pase-diario') {
      this.mostrarModalOpenMat = true;
    } else if (tipo === 'caja') {
      this.vistaActual = 'caja';
    } else if (tipo === 'directorio') {
      this.vistaActual = 'directorio';
    }
  }

  refrescarTorniquete() {
    if (this.torniquete) {
      this.torniquete.cargarDatos();
    }
  }

  volverAlDashboard() {
    this.vistaActual = 'dashboard';
    this.tarjetaActiva = '';
    this.refrescarTorniquete();
  }
}
