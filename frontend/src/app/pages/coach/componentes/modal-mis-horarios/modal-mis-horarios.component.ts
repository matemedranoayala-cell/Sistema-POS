import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { HORARIOS_KOMBAT } from '../horarios-paginados/horarios-paginados.component';

@Component({
  selector: 'app-modal-mis-horarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-mis-horarios.component.html'
})
export class ModalMisHorariosComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  private toastr = inject(ToastrService);

  todosLosHorarios: string[] = [];
  seleccionados: string[] = [];

  ngOnInit() {
    HORARIOS_KOMBAT.forEach(item => {
      item.horarios.forEach(h => {
        this.todosLosHorarios.push(`${item.disciplina} | ${h}`);
      });
    });

    const guardadoSesion = sessionStorage.getItem('horarios_coach_activos');
    const guardadoPermanente = localStorage.getItem('horarios_coach_permanentes');
    const datos = guardadoSesion || guardadoPermanente;

    if (datos) {
      try {
        this.seleccionados = JSON.parse(datos);
      } catch {}
    }
  }

  alternar(horario: string) {
    const idx = this.seleccionados.indexOf(horario);
    if (idx > -1) {
      this.seleccionados.splice(idx, 1);
    } else {
      this.seleccionados.push(horario);
    }
  }

  estaActivo(horario: string): boolean {
    return this.seleccionados.includes(horario);
  }

  usarSoloHoy() {
    if (this.seleccionados.length === 0) {
      this.toastr.warning('Selecciona al menos un horario.', 'Mis Horarios');
      return;
    }
    sessionStorage.setItem('horarios_coach_activos', JSON.stringify(this.seleccionados));
    this.toastr.info('Horario cargado en tu sesión actual.', 'Mis Horarios');
    this.cerrar.emit();
  }

  guardarPermanente() {
    if (this.seleccionados.length === 0) {
      this.toastr.warning('Selecciona al menos un horario.', 'Mis Horarios');
      return;
    }
    const json = JSON.stringify(this.seleccionados);
    localStorage.setItem('horarios_coach_permanentes', json);
    sessionStorage.setItem('horarios_coach_activos', json);
    this.toastr.success('Tus horarios quedaron guardados permanentemente.', 'Mis Horarios');
    this.cerrar.emit();
  }
}
