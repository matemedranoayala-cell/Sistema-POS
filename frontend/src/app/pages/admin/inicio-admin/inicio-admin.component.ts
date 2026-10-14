import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarraSuperiorAdminComponent } from '../componentes/barra-superior-admin/barra-superior-admin.component';
import { TarjetaMetricaComponent } from '../componentes/tarjeta-metrica/tarjeta-metrica.component';
import { UsuariosActivosComponent } from '../componentes/usuarios-activos/usuarios-activos.component';
import { LogsPaginadosComponent } from '../componentes/logs-paginados/logs-paginados.component';
import { ModalCrearUsuarioComponent } from '../componentes/modal-crear-usuario/modal-crear-usuario.component';
import { ModalExportarComponent } from '../componentes/modal-exportar/modal-exportar.component';
import { ModalGraficosComponent } from '../componentes/modal-graficos/modal-graficos.component';
import { ModalGestionUsuariosComponent } from '../componentes/modal-gestion-usuarios/modal-gestion-usuarios.component';
import { VentaService } from '../../../services/venta.service';
import { AlumnoService } from '../../../services/alumno.service';
import { ReporteEquipoService } from '../../../services/reporte-equipo.service';

@Component({
  selector: 'app-inicio-admin',
  standalone: true,
  imports: [
    CommonModule,
    BarraSuperiorAdminComponent,
    TarjetaMetricaComponent,
    UsuariosActivosComponent,
    LogsPaginadosComponent,
    ModalCrearUsuarioComponent,
    ModalExportarComponent,
    ModalGraficosComponent,
    ModalGestionUsuariosComponent
  ],
  templateUrl: './inicio-admin.component.html',
  styleUrls: ['./inicio-admin.component.css']
})
export class InicioAdminComponent implements OnInit {
  @ViewChild(UsuariosActivosComponent) panelUsuarios!: UsuariosActivosComponent;
  @ViewChild(LogsPaginadosComponent) panelLogs!: LogsPaginadosComponent;

  private ventaService = inject(VentaService);
  private alumnoService = inject(AlumnoService);
  private reporteService = inject(ReporteEquipoService);

  mostrarModalUsuario = false;
  mostrarModalExportar = false;
  mostrarModalGraficos = false;
  mostrarModalGestion = false;
  tipoGraficoActual = '';

  ingresosTexto = 'Bs 0';
  ocupacionTexto = '0 Atletas';
  danosTexto = '0 Pendientes';

  ngOnInit() {
    this.cargarMetricas();
  }

  cargarMetricas() {
    this.ventaService.obtenerVentas().subscribe({
      next: (ventas) => {
        const total = (ventas || []).reduce((acc, v) => acc + Number(v.total || 0), 0);
        this.ingresosTexto = `Bs ${total.toLocaleString('es-BO')}`;
      }
    });

    this.alumnoService.obtenerAlumnos().subscribe({
      next: (alumnos) => {
        const total = Array.isArray(alumnos) ? alumnos.length : 0;
        this.ocupacionTexto = `${total} Atletas`;
      }
    });

    this.reporteService.obtenerReportes().subscribe({
      next: (reportes) => {
        const total = Array.isArray(reportes) ? reportes.length : 0;
        this.danosTexto = `${total} Pendientes`;
      }
    });
  }

  refrescarPaneles() {
    this.cargarMetricas();
    if (this.panelUsuarios) {
      this.panelUsuarios.cargarPersonal();
    }
    if (this.panelLogs) {
      this.panelLogs.cargarLogs();
    }
  }

  abrirCreacion() {
    this.mostrarModalUsuario = true;
  }

  abrirFiltrosExportacion() {
    this.mostrarModalExportar = true;
  }

  abrirGestionUsuarios() {
    this.mostrarModalGestion = true;
  }

  abrirGrafico(tipo: string) {
    this.tipoGraficoActual = tipo;
    this.mostrarModalGraficos = true;
  }
}
