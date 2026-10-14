import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PersonalService } from '../../../../services/personal.service';

@Component({
  selector: 'app-modal-crear-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-crear-usuario.component.html'
})
export class ModalCrearUsuarioComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() usuarioCreado = new EventEmitter<void>();

  private personalService = inject(PersonalService);
  private toastr = inject(ToastrService);

  nuevoUsuario = {
    rol: 'COACH',
    username: '',
    password: ''
  };

  registrarUsuario() {
    if (!this.nuevoUsuario.rol || !this.nuevoUsuario.username.trim() || !this.nuevoUsuario.password.trim()) {
      this.toastr.warning('Completa el rol, usuario y contraseña.', 'Datos Incompletos');
      return;
    }

    this.personalService.crearPersonal({
      username: this.nuevoUsuario.username.trim(),
      password: this.nuevoUsuario.password.trim(),
      rol: this.nuevoUsuario.rol
    }).subscribe({
      next: () => {
        this.toastr.success(`Usuario ${this.nuevoUsuario.username} guardado correctamente.`, 'Personal Registrado');
        this.usuarioCreado.emit();
        this.cerrar.emit();
      },
      error: (err) => {
        const msg = err?.error?.error || 'No se pudo guardar el usuario.';
        this.toastr.error(msg, 'Error');
      }
    });
  }
}
