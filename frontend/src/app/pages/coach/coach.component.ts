import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-coach',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.css']
})
export class CoachComponent implements OnInit {
  fechaActual = 'Sunday, September 27, 2026';
  usuarioActual = 'Coach Marcos (Muay Thai)';

  // Estado de la clase
  claseActiva = false;

  // Modales
  mostrarModalLista = false;
  mostrarModalReporte = false;
  reporteForm!: FormGroup;

  // Lista de alumnos que Recepción ya dejó pasar por el torniquete
  alumnosEnTatami = [
    { nombre: 'Camila Vaca', plan: 'Plan Ilimitado', nivel: 'Avanzado', asistencia: false, color: 'blue' },
    { nombre: 'Luis Gómez', plan: 'Plan 3x / semana', nivel: 'Intermedio', asistencia: false, color: 'green' },
    { nombre: 'Diana Paz', plan: 'Pase Diario', nivel: 'Principiante', asistencia: false, color: 'orange' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.reporteForm = this.fb.group({
      equipo: ['', Validators.required],
      gravedad: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  toggleClase() {
    this.claseActiva = !this.claseActiva;
  }

  abrirModal(modal: string) {
    if (modal === 'lista') this.mostrarModalLista = true;
    if (modal === 'reporte') this.mostrarModalReporte = true;
  }

  cerrarModales() {
    this.mostrarModalLista = false;
    this.mostrarModalReporte = false;
    this.reporteForm.reset();
  }

  // Lógica de Asistencia
  marcarAsistencia(index: number) {
    this.alumnosEnTatami[index].asistencia = !this.alumnosEnTatami[index].asistencia;
  }

  guardarLista() {
    const presentes = this.alumnosEnTatami.filter(a => a.asistencia).length;
    alert(`Asistencia guardada: ${presentes} alumnos presentes en el tatami.`);
    this.cerrarModales();
  }

  // Lógica de Reporte
  enviarReporte() {
    if (this.reporteForm.valid) {
      alert('Reporte enviado a Administración y Mantenimiento.');
      this.cerrarModales();
    } else {
      Object.keys(this.reporteForm.controls).forEach(key => this.reporteForm.get(key)?.markAsTouched());
    }
  }
}
