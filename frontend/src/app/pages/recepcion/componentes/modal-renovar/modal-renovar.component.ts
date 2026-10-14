import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AlumnoService } from '../../../../services/alumno.service';
import { RenovacionService } from '../../../../services/renovacion.service';

@Component({
  selector: 'app-modal-renovar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-renovar.component.html',
  styleUrls: ['./modal-renovar.component.css']
})
export class ModalRenovarComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() renovado = new EventEmitter<void>();

  private alumnoService = inject(AlumnoService);
  private renovacionService = inject(RenovacionService);
  private toastr = inject(ToastrService);

  alumnos: any[] = [];
  alumnoSeleccionado: any = null;

  datosRenovacion = {
    dni: '',
    plan: '2',
    metodoPago: 'Efectivo'
  };

  ngOnInit() {
    this.alumnoService.obtenerAlumnos().subscribe({
      next: (data) => {
        this.alumnos = Array.isArray(data) ? data : [];
      },
      error: () => {
        this.alumnos = [];
      }
    });
  }

  get sugerenciasPorCI(): any[] {
    const ci = String(this.datosRenovacion.dni || '').trim();
    if (!ci) return [];
    return this.alumnos.filter(a => String(a.dni || '').includes(ci)).slice(0, 4);
  }

  alEscribirCI() {
    const ci = String(this.datosRenovacion.dni || '').trim();
    this.alumnoSeleccionado = this.alumnos.find(
      a => String(a.dni || '').trim() === ci
    ) || null;
  }

  seleccionarAlumno(a: any) {
    this.alumnoSeleccionado = a;
    this.datosRenovacion.dni = String(a.dni || '');
    if (a.plan_id) {
      this.datosRenovacion.plan = String(a.plan_id);
    }
  }

  procesarRenovacion() {
    const ciBuscado = String(this.datosRenovacion.dni || '').trim();
    if (!ciBuscado || !this.datosRenovacion.plan || !this.datosRenovacion.metodoPago) {
      this.toastr.warning(
        'Ingresa el CI del alumno, el plan y el metodo de pago.',
        'Datos Incompletos'
      );
      return;
    }

    const encontrado = this.alumnoSeleccionado || this.alumnos.find(
      a => String(a.dni || '').trim() === ciBuscado
    );

    if (!encontrado) {
      this.toastr.error(
        `No existe un alumno registrado con el CI ${ciBuscado}.`,
        'CI No Encontrado'
      );
      return;
    }

    const monto = this.datosRenovacion.plan === '2' ? 350 : 250;
    const fechaVenc = new Date();
    fechaVenc.setDate(fechaVenc.getDate() + 30);
    const proximoVencimiento = fechaVenc.toISOString().split('T')[0];

    this.renovacionService.registrarRenovacion({
      alumno: Number(encontrado.id),
      monto: monto,
      metodo_pago: this.datosRenovacion.metodoPago,
      proximo_vencimiento: proximoVencimiento
    }).subscribe({
      next: () => {
        const nom = `${encontrado.nombre} ${encontrado.apellidos || ''}`.trim();
        this.toastr.success(
          `Membresia de ${nom} (CI: ${encontrado.dni}) renovada hasta ${proximoVencimiento}.`,
          'Pago Procesado'
        );
        this.renovado.emit();
        this.cerrar.emit();
      },
      error: (err) => {
        const msg = err?.error?.error || 'Error al registrar el pago en el servidor.';
        this.toastr.error(msg, 'Error');
      }
    });
  }
}
