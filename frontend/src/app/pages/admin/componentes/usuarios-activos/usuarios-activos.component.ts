import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalService } from '../../../../services/personal.service';

@Component({
  selector: 'app-usuarios-activos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-activos.component.html',
  styleUrls: ['./usuarios-activos.component.css']
})
export class UsuariosActivosComponent implements OnInit {
  @Output() abrirGestion = new EventEmitter<void>();
  private personalService = inject(PersonalService);

  usuarios: any[] = [];

  ngOnInit() {
    this.cargarPersonal();
  }

  cargarPersonal() {
    this.personalService.listarPersonal().subscribe({
      next: (data) => {
        this.usuarios = (data || []).map(u => {
          const r = String(u.rol || 'RECEPCION').toUpperCase();
          const rolLimpio = r.includes('ADMIN') || r.includes('SUPER')
            ? 'ADMIN'
            : (r.includes('COACH') ? 'COACH' : 'RECEPCION');
          return {
            ...u,
            rol: rolLimpio
          };
        });
      },
      error: () => {
        this.usuarios = [];
      }
    });
  }

  verTodos() {
    this.abrirGestion.emit();
  }
}
