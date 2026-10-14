import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaService } from '../../../../services/venta.service';
import { AlumnoService } from '../../../../services/alumno.service';
import { ReporteEquipoService } from '../../../../services/reporte-equipo.service';

@Component({
  selector: 'app-modal-graficos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-graficos.component.html'
})
export class ModalGraficosComponent implements OnInit {
  @Input() tipoGrafico: string = 'ingresos';
  @Output() cerrar = new EventEmitter<void>();

  private ventaService = inject(VentaService);
  private alumnoService = inject(AlumnoService);
  private reporteService = inject(ReporteEquipoService);

  tituloModal = '';
  subtituloModal = '';
  totalPrincipal = '';
  barras: { etiqueta: string; valor: number; texto: string; porcentaje: number; color: string }[] = [];
  detalles: { titulo: string; subtitulo: string; derecha: string }[] = [];

  ngOnInit() {
    if (this.tipoGrafico === 'ingresos') {
      this.cargarGraficoIngresos();
    } else if (this.tipoGrafico === 'ocupacion') {
      this.cargarGraficoOcupacion();
    } else {
      this.cargarGraficoDanos();
    }
  }

  cargarGraficoIngresos() {
    this.tituloModal = 'Métricas de Ingresos Consolidados';
    this.subtituloModal = 'Distribución real por método de pago en PostgreSQL';

    this.ventaService.obtenerVentas().subscribe({
      next: (ventas) => {
        const lista = Array.isArray(ventas) ? ventas : [];
        const total = lista.reduce((acc, v) => acc + Number(v.total || 0), 0);
        this.totalPrincipal = `Bs ${total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;

        let efectivo = 0;
        let qr = 0;
        lista.forEach(v => {
          const m = String(v.metodo_pago || '').toLowerCase();
          if (m.includes('qr') || m.includes('transf')) {
            qr += Number(v.total || 0);
          } else {
            efectivo += Number(v.total || 0);
          }
        });

        const base = total > 0 ? total : 1;
        this.barras = [
          {
            etiqueta: 'Efectivo en Caja',
            valor: efectivo,
            texto: `Bs ${efectivo.toFixed(2)}`,
            porcentaje: Math.round((efectivo / base) * 100),
            color: '#10b981'
          },
          {
            etiqueta: 'QR / Transferencia',
            valor: qr,
            texto: `Bs ${qr.toFixed(2)}`,
            porcentaje: Math.round((qr / base) * 100),
            color: '#2563eb'
          }
        ];

        this.detalles = lista.slice(0, 5).map(v => ({
          titulo: `Venta #${v.id} - ${v.metodo_pago || 'Efectivo'}`,
          subtitulo: `${v.fecha || 'Hoy'} ${v.hora || ''}`,
          derecha: `Bs ${Number(v.total || 0).toFixed(2)}`
        }));
      }
    });
  }

  cargarGraficoOcupacion() {
    this.tituloModal = 'Métricas de Ocupación Global';
    this.subtituloModal = 'Distribución de atletas inscritos por disciplina';

    this.alumnoService.obtenerAlumnos().subscribe({
      next: (alumnos) => {
        const lista = Array.isArray(alumnos) ? alumnos : [];
        const total = lista.length;
        this.totalPrincipal = `${total} Atletas Activos`;

        const conteo: Record<string, number> = {
          'MMA': 0,
          'Kickboxing': 0,
          'Jiu Jitsu': 0,
          'Boxeo': 0,
          'Open Mat': 0
        };

        lista.forEach(a => {
          const d = String(a.disciplina_id || 'MMA');
          conteo[d] = (conteo[d] || 0) + 1;
        });

        const colores = ['#ef4444', '#2563eb', '#8b5cf6', '#f59e0b', '#10b981'];
        const base = total > 0 ? total : 1;

        this.barras = Object.keys(conteo).map((disc, idx) => ({
          etiqueta: disc,
          valor: conteo[disc],
          texto: `${conteo[disc]} atletas`,
          porcentaje: Math.round((conteo[disc] / base) * 100),
          color: colores[idx % colores.length]
        }));

        this.detalles = lista.slice(0, 5).map(a => ({
          titulo: `${a.nombre || ''} ${a.apellidos || ''}`.trim().toUpperCase(),
          subtitulo: `CI: ${a.dni || 'S/N'} | Academia: ${a.academia_origen || 'Kombat'}`,
          derecha: `${a.disciplina_id || 'MMA'} (Plan ${a.plan_id || 1})`
        }));
      }
    });
  }

  cargarGraficoDanos() {
    this.tituloModal = 'Reporte de Daños y Mantenimiento';
    this.subtituloModal = 'Estado del equipamiento reportado por entrenadores';

    this.reporteService.obtenerReportes().subscribe({
      next: (reportes) => {
        const lista = Array.isArray(reportes) ? reportes : [];
        const total = lista.length;
        this.totalPrincipal = `${total} Reportes Registrados`;

        let leves = 0;
        let moderados = 0;
        let criticos = 0;

        lista.forEach(r => {
          const est = String(r.estado_danio || '').toLowerCase();
          if (est.includes('crit') || est.includes('grav')) {
            criticos++;
          } else if (est.includes('mod') || est.includes('med')) {
            moderados++;
          } else {
            leves++;
          }
        });

        const base = total > 0 ? total : 1;
        this.barras = [
          {
            etiqueta: 'Daño Leve / Desgaste',
            valor: leves,
            texto: `${leves} equipos`,
            porcentaje: Math.round((leves / base) * 100),
            color: '#f59e0b'
          },
          {
            etiqueta: 'Daño Moderado',
            valor: moderados,
            texto: `${moderados} equipos`,
            porcentaje: Math.round((moderados / base) * 100),
            color: '#f97316'
          },
          {
            etiqueta: 'Daño Crítico / Urgente',
            valor: criticos,
            texto: `${criticos} equipos`,
            porcentaje: Math.round((criticos / base) * 100),
            color: '#ef4444'
          }
        ];

        this.detalles = lista.slice(0, 5).map(r => ({
          titulo: String(r.equipo || 'Equipo General').toUpperCase(),
          subtitulo: r.descripcion || 'Sin descripción',
          derecha: r.estado_danio || 'Reportado'
        }));
      }
    });
  }
}
