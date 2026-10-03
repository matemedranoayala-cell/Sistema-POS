import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export const HORARIOS_KOMBAT = [
  { disciplina: 'Kickboxing', horarios: ['Lu/Mie/Vie 9:00-10:15', 'Lu/Mie 18:00-19:30', 'Mar/Jue 16:30-18:00', 'Mar/Jue 19:30-21:00'] },
  { disciplina: 'Brazilian Jiujitsu', horarios: ['Lu/Mie/Vie 7:00-8:30 AM', 'Lu/Mie/Vie 19:30-21:00'] },
  { disciplina: 'Boxeo', horarios: ['Lu/Mie/Vie 16:30-18:00', 'Mar/Jue 19:30-20:45'] },
  { disciplina: 'MMA', horarios: ['Lu/Mie/Vie 16:30-18:00', 'Lu/Mie 18:00-19:30 (Competidores)'] },
  { disciplina: 'Grappling', horarios: ['Mar/Jue 16:30-18:00 (Fundamentals)', 'Mar/Jue 18:00-19:30 (Avanzado)'] },
  { disciplina: 'Wrestling', horarios: ['Martes 7:30-9:00 AM'] },
  { disciplina: 'Boxeo Teens', horarios: ['Lu/Mie/Vie 15:30-16:30 (10-16 años)'] },
  { disciplina: 'Niños/Kids', horarios: ['Lu/Mie/Vie 15:30-16:30 (MMA 4-8)', 'Mar/Jue 18:30-19:30 (BJJ 9-12)', 'Mar/Jue 19:30-20:30 (Kickboxing 9-12)'] },
  { disciplina: 'Open Mat', horarios: ['Sábados 11:00 AM (Abierto todas academias)'] }
];

@Component({
  selector: 'app-coach',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.css']
})
export class CoachComponent implements OnInit {
  fechaActual = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  usuarioActual = 'Entrenador';

  claseActiva = false;
  mostrarModalLista = false;
  mostrarModalReporte = false;
  reporteForm!: FormGroup;

  listaHorarios = HORARIOS_KOMBAT;

  private readonly http = inject(HttpClient);

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    const session = localStorage.getItem('kombat-session');
    if(session) {
      const parsed = JSON.parse(session);
      this.usuarioActual = parsed.username || 'Entrenador';
    }

    this.reporteForm = this.fb.group({
      equipo: ['', Validators.required],
      gravedad: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  toggleClase() { this.claseActiva = !this.claseActiva; }

  abrirModal(modal: string) {
    if (modal === 'lista') this.mostrarModalLista = true;
    if (modal === 'reporte') this.mostrarModalReporte = true;
  }

  cerrarModales() {
    this.mostrarModalLista = false;
    this.mostrarModalReporte = false;
    this.reporteForm.reset();
  }

  async guardarLista(clase: string, total: string) {
    if (!clase) { alert("Por favor selecciona la clase impartida."); return; }
    if (!total || Number(total) <= 0) { alert("Por favor ingresa una cantidad válida de alumnos."); return; }

    try {
      // 1. Guardar la clase oficial en la base de datos
      await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/registro-clases/', {
        coach: this.usuarioActual,
        clase_impartida: clase,
        total_asistentes: Number(total)
      }));

      // 2. Registrar en la Bitácora del Admin
      await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/bitacora/', {
        usuario: this.usuarioActual,
        operacion: 'Firma de Clase',
        modulo: 'Tatami / Entrenamiento',
        detalle: `El coach registró ${total} alumnos en la clase de ${clase}.`,
        estado: 'Completado',
        color: 'green'
      }));

      alert(`Firma digital exitosa: Clase de ${clase} registrada con un total de ${total} alumnos asistentes.`);
      this.cerrarModales();
      this.claseActiva = false;
    } catch (error) {
      alert("Error al guardar la asistencia en el servidor.");
    }
  }

  async enviarReporte() {
    if (this.reporteForm.valid) {
      const payload = {
        equipo: this.reporteForm.value.equipo,
        estado_danio: this.reporteForm.value.gravedad,
        descripcion: this.reporteForm.value.descripcion
      };

      try {
        await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/reportes-equipo/', payload));

        await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/bitacora/', {
          usuario: this.usuarioActual,
          operacion: 'Reporte de Daño',
          modulo: 'Mantenimiento',
          detalle: `Daño ${this.reporteForm.value.gravedad} en ${this.reporteForm.value.equipo}: ${this.reporteForm.value.descripcion}`,
          estado: 'Pendiente',
          color: 'red'
        }));

        alert('Reporte registrado oficialmente en la base de datos.');
        this.cerrarModales();
      } catch (error) { alert('Error al enviar el reporte.'); }
    } else {
      Object.keys(this.reporteForm.controls).forEach(key => this.reporteForm.get(key)?.markAsTouched());
    }
  }
}
