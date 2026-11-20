import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ResumenSuperadmin, SuperadminService } from '../../services/superadmin.service';
import { CuentasSistemaComponent } from './componentes/cuentas-sistema/cuentas-sistema.component';
import { RevisionArqueosComponent } from './componentes/revision-arqueos/revision-arqueos.component';

@Component({
  selector: 'app-superadmin',
  standalone: true,
  imports: [CommonModule, CuentasSistemaComponent, RevisionArqueosComponent],
  templateUrl: './superadmin.component.html',
  styleUrls: ['./superadmin.component.css']
})
export class SuperadminComponent implements OnInit {
  private authService = inject(AuthService);
  private superadminService = inject(SuperadminService);
  private router = inject(Router);

  fechaActual = '';
  usuarioActual = '';

  resumen: ResumenSuperadmin | null = null;
  cargando = false;
  errorCarga = false;

  // --- Datos de ejemplo: estas tarjetas todavía no están conectadas al backend.
  churnData = {
    nuevasInscripciones: 45,
    abandonos: 12,
    tasaRetencion: 88.5,
    planMayorFuga: '2x / sem'
  };

  auditoriaForense = [
    { tiempo: '19:45:12', ip: '192.168.1.12', accion: 'Anulación de Recibo', detalle: 'Ticket TKT-081 anulado post-pago (Bs 250)', modulo: 'Recepción', usuario: 'Camila Vaca', color: 'red' },
    { tiempo: '18:30:00', ip: '192.168.1.18', accion: 'Descuento Manual', detalle: 'Se aplicó -20% a Mensualidad Ilimitada', modulo: 'Tienda/POS', usuario: 'Javier Morales', color: 'orange' },
    { tiempo: '16:15:22', ip: '192.168.1.12', accion: 'Eliminación Registro', detalle: 'Atleta "Juan P." eliminado del padrón', modulo: 'Control', usuario: 'Camila Vaca', color: 'red' },
    { tiempo: '14:05:10', ip: 'Sistema', accion: 'Cierre de Turno', detalle: 'Arqueo automático (Diferencia: Bs 0.00)', modulo: 'Core', usuario: 'Auto-Task', color: 'blue' }
  ];

  personalEnLinea = [
    { nombre: 'Camila (Recepción)', rol: 'Recepcionista', ubicacion: 'Recepción Central', estado: 'Activo', color: 'green' },
    { nombre: 'Coach Marcos', rol: 'Entrenador', ubicacion: 'Tatami Principal', estado: 'En Clase', color: 'orange' }
  ];
  // ---

  ngOnInit(): void {
    const fecha = new Date().toLocaleDateString('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    this.fechaActual = fecha.charAt(0).toUpperCase() + fecha.slice(1);
    this.usuarioActual = this.authService.obtenerSesion().username;
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.cargando = true;
    this.superadminService.obtenerResumen().subscribe({
      next: resumen => {
        this.resumen = resumen;
        this.cargando = false;
        this.errorCarga = false;
      },
      error: () => {
        this.cargando = false;
        this.errorCarga = true;
      }
    });
  }

  /** "2026-11-18" -> "mar 18/11" */
  formatearDia(iso: string): string {
    const [anio, mes, dia] = iso.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    const nombre = fecha.toLocaleDateString('es-BO', { weekday: 'short' }).replace('.', '');
    return `${nombre} ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;
  }

  textoAsistencias(conteo: number): string {
    return `${conteo} ${conteo === 1 ? 'asistencia' : 'asistencias'}`;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
