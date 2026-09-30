import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-superadmin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './superadmin.component.html',
  styleUrls: ['./superadmin.component.css']
})
export class SuperadminComponent {
  fechaActual = 'Sunday, September 27, 2026';
  usuarioActual = 'ADK (Root Access)';

  metricasVitales = {
    ingresoDiario: 4250,
    mrrMensual: 112400,
    atletasActivos: 342,
    visitasHoy: 128
  };

  churnData = {
    nuevasInscripciones: 45,
    abandonos: 12,
    tasaRetencion: 88.5,
    riesgoGlobal: 'Bajo',
    planMayorFuga: '2x / sem'
  };

  prediccionesInventario = [
    { producto: 'Agua Mineral 500ml', ritmoVenta: 'Alto', agotaEn: 'Jueves 18:00', confianza: 94, sugerencia: 'Comprar 50u', color: 'red' },
    { producto: 'Pre-entreno C4', ritmoVenta: 'Medio', agotaEn: 'Sábado 10:00', confianza: 82, sugerencia: 'Comprar 12u', color: 'orange' }
  ];

  heatmapHoras = ['06:00', '09:00', '12:00', '16:00', '19:00', '21:00'];
  heatmapDias = [
    { dia: 'Lun', valores: ['low', 'med', 'low', 'high', 'max', 'med'] },
    { dia: 'Mar', valores: ['low', 'low', 'low', 'med', 'high', 'high'] },
    { dia: 'Mié', valores: ['med', 'med', 'low', 'high', 'max', 'med'] },
    { dia: 'Jue', valores: ['low', 'low', 'low', 'med', 'high', 'med'] },
    { dia: 'Vie', valores: ['low', 'med', 'low', 'med', 'med', 'low'] }
  ];

  auditoriaForense = [
    { tiempo: '19:45:12', ip: '192.168.1.12', accion: 'Anulación de Recibo', detalle: 'Ticket TKT-081 anulado post-pago (Bs 250)', modulo: 'Recepción', usuario: 'Camila Vaca', color: 'red' },
    { tiempo: '18:30:00', ip: '192.168.1.18', accion: 'Descuento Manual', detalle: 'Se aplicó -20% a Mensualidad Ilimitada', modulo: 'Tienda/POS', usuario: 'Javier Morales', color: 'orange' },
    { tiempo: '16:15:22', ip: '192.168.1.12', accion: 'Eliminación Registro', detalle: 'Atleta "Juan P." eliminado del padrón', modulo: 'Control', usuario: 'Camila Vaca', color: 'red' },
    { tiempo: '14:05:10', ip: 'Sistema', accion: 'Cierre de Turno', detalle: 'Arqueo automático (Diferencia: Bs 0.00)', modulo: 'Core', usuario: 'Auto-Task', color: 'blue' }
  ];

  personalEnLinea = [
    { nombre: 'ADK (Tú)', rol: 'Superadmin', ubicacion: 'Sistema Core', ip: '192.168.1.5', login: '22:30', estado: 'Activo', color: 'blue' },
    { nombre: 'Camila (Recepción)', rol: 'Recepcionista', ubicacion: 'Recepción Central', ip: '192.168.1.12', login: '14:00', estado: 'Activo', color: 'green' },
    { nombre: 'Coach Marcos', rol: 'Entrenador', ubicacion: 'Tatami Principal', ip: '192.168.1.45', login: '17:30', estado: 'En Clase', color: 'orange' }
  ];

  ejecutarAccionMantenimiento() {
    console.log('Abriendo menú de opciones maestras...');
  }
}
