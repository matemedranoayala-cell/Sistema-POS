import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  fechaActual = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  usuarioActual = 'Administrador Operativo';

  resumen = { ingresosHoy: 0, ocupacionTotal: 0, alertasPendientes: 0 };

  supervisionCoaches = [
    { nombre: 'Marcos (Muay Thai)', estado: 'En Clase', area: 'Tatami A', color: 'blue' },
    { nombre: 'Silva (Boxeo)', estado: 'Descanso', area: 'N/A', color: 'orange' }
  ];

  logsRecepcion: any[] = [];
  mostrarModalExportar = false;
  mostrarModalLog = false;
  mostrarModalCoach = false;
  logSeleccionado: any = null;

  exportarForm!: FormGroup;
  coachForm!: FormGroup;
  fechaMaximaVisible = '';

  private readonly http = inject(HttpClient);

  constructor(private fb: FormBuilder) {}

  async ngOnInit() {
    const hoy = new Date();
    this.fechaMaximaVisible = hoy.toISOString().split('T')[0];

    this.exportarForm = this.fb.group({
      tipoReporte: ['financiero', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });

    this.coachForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['admin123', Validators.required]
    });

    await this.cargarBitacoraGeneral();
    await this.cargarMeticas();
  }

  async cargarBitacoraGeneral() {
    try {
      const logs: any = await firstValueFrom(this.http.get('http://127.0.0.1:8000/api/bitacora/'));
      this.logsRecepcion = logs.map((log: any) => {
        const fechaObj = new Date(log.fecha_hora);
        return {
          id: log.id,
          operacion: log.operacion,
          usuario: log.usuario,
          monto: log.modulo, // Usamos esta propiedad para mostrar el módulo en la UI
          hora: fechaObj.toLocaleDateString() + ' ' + fechaObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          estado: log.estado,
          color: log.color,
          detalle: log.detalle
        };
      });
    } catch (error) { console.error('Error cargando bitácora', error); }
  }

  async cargarMeticas() {
    try {
      const asistencias: any = await firstValueFrom(this.http.get('http://127.0.0.1:8000/api/asistencias/'));
      this.resumen.ocupacionTotal = asistencias.length;

      const reportes: any = await firstValueFrom(this.http.get('http://127.0.0.1:8000/api/reportes-equipo/'));
      this.resumen.alertasPendientes = reportes.length;
    } catch (error) {}
  }

  abrirModalExportar() { this.mostrarModalExportar = true; }
  abrirModalLog(log: any) { this.logSeleccionado = log; this.mostrarModalLog = true; }
  abrirModalCoach() { this.mostrarModalCoach = true; }

  cerrarModales() {
    this.mostrarModalExportar = false;
    this.mostrarModalLog = false;
    this.mostrarModalCoach = false;
    this.logSeleccionado = null;
    this.exportarForm.reset({ tipoReporte: 'financiero' });
    this.coachForm.reset({ password: 'admin123' });
  }

  async crearCoach() {
    if (this.coachForm.valid) {
      try {
        await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/crear-coach/', this.coachForm.value));
        alert('Coach creado exitosamente. Ya puede iniciar sesión.');
        this.cerrarModales();
      } catch (error: any) { alert(error.error?.error || 'Error al crear el coach'); }
    } else {
      Object.keys(this.coachForm.controls).forEach(key => this.coachForm.get(key)?.markAsTouched());
    }
  }

  async autorizarOperacion() {
    try {
      // ESTO GUARDA EL ESTADO VERIFICADO EN LA BITÁCORA DE LA BASE DE DATOS REAL
      await firstValueFrom(this.http.patch(`http://127.0.0.1:8000/api/bitacora/${this.logSeleccionado.id}/`, {
        estado: 'Revisado y Firmado',
        color: 'green'
      }));

      alert(`Operación autorizada y guardada exitosamente.`);
      this.logSeleccionado.estado = 'Revisado y Firmado';
      this.logSeleccionado.color = 'green';
      this.cerrarModales();
    } catch (error) {
      alert("Hubo un error al intentar guardar en la base de datos.");
    }
  }

  generarReporte() {
    if (this.exportarForm.valid) {
      let csv = '\uFEFF';

      csv += 'Fecha y Hora,Usuario Responsable,Modulo Afectado,Operacion,Estado,Detalle\n';

      this.logsRecepcion.forEach(log => {
        const detalleLimpio = log.detalle ? log.detalle.replace(/\n/g, ' ') : '';
        csv += `"${log.hora}","${log.usuario}","${log.monto}","${log.operacion}","${log.estado}","${detalleLimpio}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `Auditoria_Kombat_${new Date().getTime()}.csv`;
      enlace.click();
      window.URL.revokeObjectURL(url);

      this.cerrarModales();
    } else {
      Object.keys(this.exportarForm.controls).forEach(key => this.exportarForm.get(key)?.markAsTouched());
    }
  }
}
